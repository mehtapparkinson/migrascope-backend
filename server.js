const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
require('dotenv').config({ path: './db/key.env' });
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for your frontend's origin
const corsOptions = {
  origin: 'http://localhost:3000',  // Allow requests only from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Restrict the allowed HTTP methods
  credentials: true,  // Enable cookies if you're using them (optional)
};

// Middleware
app.use(cors(corsOptions));  // Apply the CORS options
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
