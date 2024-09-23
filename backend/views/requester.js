import express from 'express';
import mongoose from 'mongoose';
import { User, UserUploads } from '../models/user.js'; // Adjust the path as needed
import { create } from 'kubo-rpc-client';
import multer from 'multer';

const router = express.Router();
const ipfs = create({ url: 'http://localhost:5001' });

// Utility function to get or create upload event model

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
  console.log(ipfsHash)

  if (!ipfsHash) {
      return res.status(400).send('CID is required');  // Handle missing CID
  }

  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(ipfsHash)) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Setting the response headers to indicate a PDF file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${ipfsHash}.text`);  // Use ipfsHash for dynamic filename
    
    // Send the file buffer as the response
    res.send(fileBuffer);
  } catch (error) {
    // Handle and log errors
    console.error(error);
    res.status(500).send(`Error retrieving from IPFS: ${error.message}`);
  }
});

export default router;



