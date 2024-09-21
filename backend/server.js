import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { create } from 'kubo-rpc-client';
import mongoose from 'mongoose';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session'; // Import session middleware
import { fileURLToPath } from 'url';
import User from './models/user.js';
import { encrypt, decrypt } from './utils/crypto.js'; 
import { generateUniqueNickname } from './utils/nameGeneration.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const mongoURL = 'mongodb://localhost:27017/mydatabase';

// CORS configuration
const corsOptions = {
  origin: '*',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],  
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Session middleware
app.use(session({
  secret: 'yourSecretKey',   // Change to a secure, random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set `secure: true` if using HTTPS
}));

// Connect to MongoDB
try {
  await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected successfully');
} catch (err) {
  console.error('MongoDB connection error:', err);
}

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });
const ipfs = create({ url: 'http://localhost:5001' }); // Adjust the IPFS API URL if needed

const isAuthenticated = (req, res, next) => {
  if (req.session.walletId) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.status(401).json({ message: 'Login required' }); // User is not authenticated
  }
};

app.get('/register-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


app.post('/register', async (req, res) => {
  const { metamaskId, role } = req.body;
  if (!metamaskId || !role) {
    return res.status(400).json({ message: 'Metamask ID and role are required' });
  }

  try {
    const existingUser = await User.findOne({ userAddress:metamaskId });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this Metamask ID' });
    }

    const nickname = await generateUniqueNickname();
    const newUser = new User({
      userAddress: metamaskId,
      userRole: role,
      nickName:nickname,
    });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        metamaskId: newUser.userAddress,
        role: newUser.userRoleole,
        nickname: newUser.nickName
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

app.post('/login', (req, res) => {
  const { walletId } = req.body;
  if (!walletId) {
    return res.status(400).json({ message: 'Wallet ID is required' });
  }
  req.session.walletId = walletId;
  res.json({ message: 'Login successful', walletId });
});

// Route to check if the user is logged in
app.get('/check-login', (req, res) => {
  if (req.session.walletId) {
    return res.json({ loggedIn: true, walletId: req.session.walletId });
  }
  res.json({ loggedIn: false, message: 'Not logged in' });
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
})



app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });

    // Send the file to the FastAPI microservice
    const fastApiResponse = await axios.post('http://localhost:8000/process-file/', formData, {
      headers: {
        ...formData.getHeaders(), // Set the correct headers for FormData
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Get the processed file from the FastAPI response
    const processedFileBuffer = fastApiResponse.data;

    // Upload the processed file to IPFS
    const ipfsResult = await ipfs.add(processedFileBuffer);
    res.json({ cid: ipfsResult.cid.toString() });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send(`Error processing file: ${error.message}`);
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


app.get('/users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: 'All user records have been deleted.' });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ message: 'Server error, unable to delete records.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
