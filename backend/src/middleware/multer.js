const multer = require('multer');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', '..', 'public');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Items: public/uploads/items/
const itemsDir = path.join(publicDir, 'uploads', 'items');
const itemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(itemsDir);
    cb(null, itemsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const uploadItem = multer({
  storage: itemStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Only images (jpeg, png, gif, webp) allowed'));
  },
});

// Avatars: public/uploads/avatars/
const avatarsDir = path.join(publicDir, 'uploads', 'avatars');
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(avatarsDir);
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

module.exports = {
  uploadItem: uploadItem.single('image'),
  uploadAvatar: uploadAvatar.single('avatar'),
};
