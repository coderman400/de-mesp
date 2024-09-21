import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data'; // Import form-data
import { User,UserUploads } from '../models/user.js'; // Adjust the path as needed
import { encrypt } from '../utils/crypto.js'; 
import { create } from 'kubo-rpc-client';
import mongoose from 'mongoose';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage });
const ipfs = create({ url: 'http://localhost:5001' });



// Route to get a user's upload events
router.post('/views', async (req, res) => {
    const { userAddress } = req.body;
    console.log(userAddress)
    try {
        
        const user = await UserUploads.find({ userAddress }, 'fileName disease genMedInfoHash').lean();
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ userAddress, uploads: user });
    } catch (error) {
        console.error('Error fetching user uploads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/upload', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'test.html'));
})

router.get('/view-records', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'db.html'));
})




router.post('/upload', upload.single('file'), async (req, res) => {
    const existingDocs = await UserUploads.find({ userAddress: "0xb2c57d7804b35e9610e25c16dc9ba2d1a8f6e35e" });
    console.log(existingDocs);

    const { userAddress, reportType } = req.body;
    const address = userAddress.toLowerCase()
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
        console.log(processedFileBuffer)

        // Upload to IPFS
        const ipfsResult = await ipfs.add(processedFileBuffer);
        const genMedInfoHash = ipfsResult.cid.toString();
        const encryptedHash = encrypt(genMedInfoHash, userAddress);
        const newUpload = new UserUploads({
            userAddress:address,
            fileName:file.originalname,
            disease:reportType,
            genMedInfoHash:encryptedHash,
        })

        await newUpload.save();
        res.json({ cid: ipfsResult.cid.toString() });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send(`Error processing file: ${error.message}`);
    }
});




export default router;
