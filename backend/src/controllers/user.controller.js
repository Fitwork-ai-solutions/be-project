const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const userResponse = (u) => ({
  _id: u._id,
  email: u.email,
  role: u.role,
  name: u.name,
  avatar: u.avatar,
  mobile: u.mobile ?? null,
  address: u.address ?? null,
  age: u.age ?? null,
});

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, mobile, address, age, currentPassword, newPassword } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (mobile !== undefined) updates.mobile = mobile === '' ? null : String(mobile).trim();
    if (address !== undefined) updates.address = address === '' ? null : String(address).trim();
    if (age !== undefined) updates.age = age === '' || age == null ? null : Number(age) || null;
    if (req.file) updates.avatar = `uploads/avatars/${req.file.filename}`;

    if (currentPassword != null && currentPassword !== '' && newPassword != null && newPassword !== '') {
      const userWithPass = await User.findById(req.user._id).select('+password');
      if (!userWithPass) throw new ApiError(404, 'User not found');
      const valid = await userWithPass.comparePassword(currentPassword);
      if (!valid) throw new ApiError(400, 'Current password is incorrect');
      if (newPassword.length < 6) throw new ApiError(400, 'New password must be at least 6 characters');
      updates.password = newPassword;
    } else if (currentPassword || newPassword) {
      throw new ApiError(400, 'To change password, provide both current password and new password');
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');
    Object.assign(user, updates);
    await user.save();

    const updated = await User.findById(req.user._id);
    res.json({ user: userResponse(updated) });
  } catch (err) {
    next(err);
  }
};
