import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pinataSDK from '@pinata/sdk';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Pinata SDK
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// Middleware
app.use(express.json());
app.use(cors());

// Multer to handle file uploads
const upload = multer();

app.post('/upload', upload.single('file'), async (req, res) => {
    console.log(req.file); // Add this line to see what multer is processing
    const file = req.file?.buffer;  // Safely access buffer
    if (!file) {
      return res.status(400).send('No file uploaded');
    }
    try {
      const options = {
        pinataMetadata: {
          name: req.file.originalname,
        },
      };
      const result = await pinata.pinFileToIPFS(file, options);
      res.json({ cid: result.IpfsHash });
    } catch (error) {
      res.status(500).send(`Error uploading to IPFS: ${error.message}`);
    }
});

app.get('/get/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error retrieving from IPFS');
    }
    const fileBuffer = await response.buffer();
    res.send(fileBuffer); // Send the file as a buffer
  } catch (error) {
    res.status(500).send('Error retrieving from IPFS');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
