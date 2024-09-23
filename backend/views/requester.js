const express = require('express');
const { User, UserUploads } = require('../models/user.js'); // Adjust the path as needed
const multer = require('multer');
const {download} = require('../utils/pinataUtils.js')

const router = express.Router();

// Route to get all upload events from all users
router.get('/upload-events', async (req, res) => {
    try {
        // Find all upload events from UserUploads collection
        const allUploadEvents = await UserUploads.find({}, 'userAddress disease').lean();
        // Return the found events
        res.json(allUploadEvents);
    } catch (error) {
        console.error('Error fetching upload events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const upload = multer(); // Initialize multer for form data parsing

router.post('/get', upload.none(), async (req, res) => {
    const { ipfsHash } = req.body;  // Extract 'ipfsHash' from the request body

    if (!ipfsHash) {
        return res.status(400).send('CID is required');  // Handle missing CID
    }

    try {
        const fileBuffer = await download(ipfsHash)
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=${ipfsHash}.text`);  // Use ipfsHash for dynamic filename
        res.send(fileBuffer.data);
    } catch (error) {
        // Handle and log errors
        console.error(error);
        res.status(500).send(`Error retrieving from IPFS: ${error.message}`);
    }
});

module.exports = router;
