import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Document from '../models/Document.js';

export const registerUser = async (req, res) => {
  const { fullName, email, password, phone, address, dateOfBirth } = req.body;

  try {
    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Photo ID is required' });
    }

    // 4. Prepare photoID object for MongoDB
    const photoID = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    // 5. Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
      dateOfBirth,
      photoID,
    });

    // 6. Save document for admin visibility
    await Document.create({
      userId: user._id,
      documentType: 'photoId',
      file: photoID,
    });

    // 7. Generate JWT
    const token = jwt.sign(
      { id: user._id, phone: user.phone, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 8. Send response
    res.status(201).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
      },
      token,
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Signup failed. Try again.', error: err.message });
  }
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isActive === false)
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, phone: user.phone, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
      },
      token,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Signin failed. Try again.', error: err.message });
  }
};
