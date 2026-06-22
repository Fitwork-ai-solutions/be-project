const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

exports.register = async (req, res, next) => {
  try {
    const { email, password, role, name, mobile, address, age } = req.body;
    if (!email || !password || !role || !name) {
      throw new ApiError(400, 'Email, password, role and name are required');
    }
    if (!['bidder', 'seller'].includes(role)) {
      throw new ApiError(400, 'Role must be bidder or seller');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(400, 'This email is already registered. One email cannot be used for both bidder and seller.');
    }

    const payload = { email, password, role, name };
    if (mobile != null && String(mobile).trim() !== '') payload.mobile = String(mobile).trim();
    if (address != null && String(address).trim() !== '') payload.address = String(address).trim();
    if (age != null && age !== '') payload.age = Number(age) || null;

    const user = await User.create(payload);
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { _id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar, mobile: user.mobile, address: user.address, age: user.age },
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { _id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar, mobile: user.mobile, address: user.address, age: user.age },
      token,
    });
  } catch (err) {
    next(err);
  }
};
