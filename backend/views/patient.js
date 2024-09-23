const express = require('express');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data'); // Import form-data
const { User, UserUploads } = require('../models/user.js'); // Adjust the path as needed
const { ipfsUpload } = require('../utils/pinataUtils.js')

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/views', async (req, res) => {
    const { userAddress } = req.body;
    const address = userAddress.toLowerCase(); // Ensure the address is always in lowercase

    try {
        // Fetch user uploads from the database
        const userUploads = await UserUploads.find({ userAddress: address }, 'fileName disease genMedInfoHash').lean();
        if (!userUploads || userUploads.length === 0) {
            return res.status(404).json({ message: 'No uploads found for this user' });
        }

        res.json({ userUploads });
    } catch (error) {
        console.error('Error fetching or decrypting user uploads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/upload', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'test.html'));
});

router.get('/view-records', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'db.html'));
});

router.post('/upload', upload.single('file'), async (req, res) => {
    const { userAddress, reportType } = req.body;
    const address = userAddress.toLowerCase();
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Prepare the form-data to send to FastAPI
        const form = new FormData();
        form.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        // Send the file to FastAPI
        const fastApiResponse = await axios.post('http://localhost:8000/process-file/', form, {
            headers: {
                ...form.getHeaders(), // Important to set the headers for multipart
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const processedFileBuffer = fastApiResponse.data;

        const ipfsHash = await ipfsUpload(file.originalname,processedFileBuffer)
        const newUpload = new UserUploads({
            userAddress: address,
            fileName: file.originalname,
            disease: reportType,
            genMedInfoHash: ipfsHash,
        });

        await newUpload.save();
        res.json({ cid: ipfsHash });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send(`Error processing file: ${error.message}`);
    }
});

router.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'fileupload.html'));
});

router.post('/upload2', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    const { userAddress, reportType } = req.body;
    const address = userAddress.toLowerCase();
    const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const pdfFile = req.files['file'] ? req.files['file'][0] : null;

    if (!imageFile || !pdfFile) {
        return res.status(400).send('Both image and PDF files must be uploaded');
    }

    // Check if the files are valid types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedPdfTypes = ['application/pdf'];

    if (!allowedImageTypes.includes(imageFile.mimetype)) {
        return res.status(400).send('Invalid image file type. Only JPG, PNG, and GIF are allowed.');
    }
    if (!allowedPdfTypes.includes(pdfFile.mimetype)) {
        return res.status(400).send('Invalid PDF file type.');
    }

    try {
        // Prepare the form-data to send to FastAPI
        const form = new FormData();
        form.append('description', reportType);
        form.append('imageFile', imageFile.buffer, {
            filename: imageFile.originalname,
            contentType: imageFile.mimetype,
        });
        form.append('pdfFile', pdfFile.buffer, {
            filename: pdfFile.originalname,
            contentType: pdfFile.mimetype,
        });

        // Send the files to FastAPI for processing
        const fastApiResponse = await axios.post('http://localhost:8000/process-files/', form, {
            headers: {
                ...form.getHeaders(), // Important to set the headers for multipart
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        console.log(fastApiResponse.headers);
        const validation = fastApiResponse.headers.get('x-validation-status');
        const ipfsResult = await ipfs.add(fastApiResponse.data);
        const genMedInfoHash = ipfsResult.cid.toString();
        if (validation == "Success") {
            const newUpload = new UserUploads({
                userAddress: address,
                fileName: pdfFile.originalname,
                disease: reportType,
                genMedInfoHash: genMedInfoHash,
            });

            await newUpload.save();
            res.json({ cid: genMedInfoHash, validation: validation });
        } else {
            res.json({ validation: validation });
        }
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send(`Error processing files: ${error.message}`);
    }
});

router.get('/list', async (req, res) => {
    try {
        // Use the distinct method with a filter condition for userRole
        const uniquePatientAddresses = await User.distinct('userAddress', { userRole: 'patient' });
        console.log(uniquePatientAddresses);
        // Return the unique addresses as a JSON response
        res.status(200).json({
            success: true,
            data: uniquePatientAddresses
        });
    } catch (error) {
        // Handle errors and send a response
        console.error('Error retrieving unique patient addresses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error, could not retrieve unique patient addresses',
            error: error.message
        });
    }
});

module.exports = router;
