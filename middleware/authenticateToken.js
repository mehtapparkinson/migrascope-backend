const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token invalid

    // Here, check that `user` contains both `user_id` and `username`
    console.log('Decoded user from token:', user);
    
    req.user = user; // Set the decoded user into the request object
    next();
  });
};

module.exports = authenticateToken;
