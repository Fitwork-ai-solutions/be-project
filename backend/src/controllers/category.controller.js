const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, 'Name is required');
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await Category.findOne({ slug });
    if (existing) throw new ApiError(400, 'Category with this name already exists');
    const category = await Category.create({ name, slug, description: description || '' });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};
