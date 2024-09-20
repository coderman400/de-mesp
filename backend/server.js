const express = require('express');
const cors = require('cors'); // Optional if you need to handle CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (if you need it)
app.use(express.json()); // To parse JSON requests
app.use(cors());         // Enables Cross-Origin Resource Sharing

// Example route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
