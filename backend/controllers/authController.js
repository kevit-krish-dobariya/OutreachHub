import User from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGIxMjM0ZjMwYWY4Njk0ZjMzNDdjZCIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NTM5NTIzODIsImV4cCI6MTc1Mzk1NTk4Mn0.-LC44yQGsUeeG0opWhVnBB5HI2zVh2_8YMa71aD5s0c"


export const register = async (req, res) => {
  try {
    const { username, email, password,role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashed,role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
   
    const token = jwt.sign({ id: user._id , role: user.role}, JWT_SECRET, { expiresIn: '1h' });
     console.log('This works');
    res.json({ message: 'Login successful', token, redirect: '/home' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

