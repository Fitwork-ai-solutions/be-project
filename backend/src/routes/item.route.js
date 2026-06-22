const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { protect, requireRole } = require('../middleware/auth');
const { uploadItem } = require('../middleware/multer');

router.use(protect);
router.get('/', itemController.list);
router.get('/:id', itemController.getOne);
router.post('/', requireRole('seller'), uploadItem, itemController.create);

module.exports = router;
