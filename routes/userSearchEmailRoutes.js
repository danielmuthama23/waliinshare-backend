import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET user by email
router.get('/findByEmail/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;