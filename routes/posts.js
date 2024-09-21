const express = require('express');
const pool = require('../db/index');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const cors = require('cors');

router.use(cors());

// Create a post
router.post('/', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user.user_id; 
  const author = req.user.username; 

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content, user_id, author, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [title, content, user_id, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No posts available' }); 
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err); 
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching post with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all comments for a specific post
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
    
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No comments yet' }); // Handle no comments case
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching comments for post ID ${postId}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create a comment for a specific post
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body; 
  const user_id = req.user.user_id; 
  const username = req.user.username; 

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, username, comment, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [postId, user_id, username, comment]
    );
    res.status(201).json(result.rows[0]); 
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;
