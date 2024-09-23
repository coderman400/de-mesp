const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// Import models and routes
const { User, UserUploads } = require('./models/user.js');
const patientRoutes = require('./views/patient.js');
const authRoutes = require('./views/auth.js');
const requestRoutes = require('./views/requester.js');


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
const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectToDatabase()


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
