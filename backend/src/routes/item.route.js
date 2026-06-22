const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { protect, requireRole } = require('../middleware/auth');
const { uploadItem } = require('../middleware/multer');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);
router.get('/', itemController.list);
router.get('/:id', validateObjectId('id'), itemController.getOne);
router.post('/', requireRole('seller'), uploadItem, itemController.create);

module.exports = router;
