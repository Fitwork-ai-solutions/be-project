const Item = require('../models/item.model');
const ApiError = require('../utils/ApiError');

exports.create = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !category) throw new ApiError(400, 'Name and category are required');
    const imagePath = req.file ? `uploads/items/${req.file.filename}` : null;
    const item = await Item.create({
      name,
      description: description || '',
      category,
      image: imagePath,
      seller: req.user._id,
    });
    await item.populate('category', 'name slug');
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { category, seller } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (seller) filter.seller = seller;
    const items = await Item.find(filter).populate('category', 'name slug').populate('seller', 'name email').sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('category', 'name slug').populate('seller', 'name email');
    if (!item) throw new ApiError(404, 'Item not found');
    res.json({ item });
  } catch (err) {
    next(err);
  }
};
