const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', categoryController.list);
router.post('/', protect, requireRole('seller'), categoryController.create);

module.exports = router;
