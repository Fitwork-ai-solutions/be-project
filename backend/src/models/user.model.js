const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, required: true, enum: ['bidder', 'seller'] },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: null }, // path in public/uploads/avatars/
    mobile: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    age: { type: Number, default: null, min: 1, max: 150 },
  },
  { timestamps: true }
);

// One email = one account (bidder or seller, not both)
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
