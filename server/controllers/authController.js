import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT generator helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Determine role (default is user; if email contains admin@pawlink.org, make it admin for quick testing!)
    const role = email.toLowerCase().includes('admin@pawlink.org') ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasPet: user.hasPet
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasPet: user.hasPet
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Update pet preference (hasPet questionnaire response)
// @route   PUT /api/auth/update-pet-preference
// @access  Private
export const updatePetPreference = async (req, res) => {
  const { hasPet } = req.body;

  if (typeof hasPet !== 'boolean') {
    return res.status(400).json({ success: false, message: 'hasPet must be a boolean value' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.hasPet = hasPet;
      await user.save();

      res.json({
        success: true,
        message: 'Pet preference updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasPet: user.hasPet
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Pet Preference Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating pet preference' });
  }
};
