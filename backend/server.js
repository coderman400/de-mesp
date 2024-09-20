import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { create } from 'kubo-rpc-client';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import { encrypt, decrypt } from './utils/crypto.js'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const mongoURL = 'mongodb://localhost:27017/mydatabase';

const corsOptions = {
  origin: '*',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],  
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public's
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

try {
  await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected successfully');
} catch (err) {
  console.error('MongoDB connection error:', err);
}

const storage = multer.memoryStorage();
const upload = multer({ storage });
const ipfs = create({ url: 'http://localhost:5001' }); // Adjust the IPFS API URL if needed


app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'))
})

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log(req)
  const file = req.file;
  console.log(file);

  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const result = await ipfs.add(file.buffer);
    res.json({ cid: result.cid.toString() });
  } catch (error) {
    res.status(500).send(`Error uploading to IPFS: ${error.message}`);
  }
});


app.get('/get/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${cid}.pdf`);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).send(`Error retrieving from IPFS: ${error.message}`);
  }
});

app.get('/crypto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test1.html'));
});

app.post('/encrypt', (req, res) => {
  const { walletId, ipfsHash } = req.body;
  const encryptedHash = encrypt(ipfsHash, walletId);
  res.json({ encryptedHash });
});

// View to decrypt IPFS hash
app.post('/decrypt', (req, res) => {
  const { walletId, encryptedHash } = req.body;
  const decryptedHash = decrypt(encryptedHash, walletId);
  res.json({ decryptedHash });
});



app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
