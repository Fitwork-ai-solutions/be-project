const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const { uploadAvatar } = require('../middleware/multer');

router.use(protect);
router.get('/me', userController.getMe);
router.patch('/me', uploadAvatar, userController.updateProfile);

module.exports = router;
