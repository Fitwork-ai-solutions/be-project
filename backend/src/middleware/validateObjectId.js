const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    const id = req.params[param];
    if (id && !mongoose.isValidObjectId(id)) {
      return next(new ApiError(400, `Invalid ${param}`));
    }
  }
  next();
};

module.exports = validateObjectId;
