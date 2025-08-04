import jwt from 'jsonwebtoken';

const JWT_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGIxMjM0ZjMwYWY4Njk0ZjMzNDdjZCIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NTM5NTIzODIsImV4cCI6MTc1Mzk1NTk4Mn0.-LC44yQGsUeeG0opWhVnBB5HI2zVh2_8YMa71aD5s0c"

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
export default verifyToken;