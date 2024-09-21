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
import { User,UserUploads } from './models/user.js';
import { encrypt, decrypt } from './utils/crypto.js'; 
import { generateUniqueNickname } from './utils/nameGeneration.js';
import patientRoutes from './views/patient.js'
import authRoutes from './views/auth.js'
import requestRoutes from './views/requester.js'

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


app.use('/user', patientRoutes);
app.use('/auth', authRoutes);
app.use('/request', requestRoutes);

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

try {
  await UserUploads.collection.dropIndex('userAddress_1');
  console.log('Dropped existing index on userAddress.');
} catch (error) {
  if (error.code !== 27) { // Index not found error
      console.error('Error dropping index:', error);
  }
}



app.get('/users', async (req, res) => {
  try {
    await User.deleteMany({});
    await UserUploads.deleteMany({});
    res.status(200).json({ message: 'All user records have been deleted.' });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ message: 'Server error, unable to delete records.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
