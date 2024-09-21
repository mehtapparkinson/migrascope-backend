const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/index'); 
const authenticateToken = require('../middleware/authenticateToken'); 
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const result = await pool.query(  
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error during registration:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login user route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token 
        const token = jwt.sign(
            { user_id: user.id, username: user.username }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get user profile info (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT username, email, created_at FROM users WHERE id = $1', [req.user.user_id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user posts
router.get('/profile/posts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.user_id]);

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching user posts:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  

module.exports = router;
