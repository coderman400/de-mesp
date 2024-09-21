import express from 'express';
import mongoose from 'mongoose';
import { User, UserUploads } from '../models/user.js'; // Adjust the path as needed
import { create } from 'kubo-rpc-client';

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

router.get('/get/:cid', async (req, res) => {
    const { cid } = req.params;
  
    try {
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=${cid}.txt`);
      res.send(fileBuffer);
    } catch (error) {
      res.status(500).send(`Error retrieving from IPFS: ${error.message}`);
    }
  });

export default router;
