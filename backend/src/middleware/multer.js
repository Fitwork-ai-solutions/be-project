const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const publicDir = path.join(__dirname, '..', '..', 'public');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const imageFilter = (req, file, cb) => {
  const allowed = /image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype);
  if (allowed) cb(null, true);
  else cb(new Error('Only images (jpeg, png, gif, webp) allowed'));
};

const useCloud = isCloudinaryConfigured();

// Item storage
const itemStorage = useCloud
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'auction-app/items',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(publicDir, 'uploads', 'items');
        ensureDir(dir);
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    });

// Avatar storage
const avatarStorage = useCloud
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'auction-app/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(publicDir, 'uploads', 'avatars');
        ensureDir(dir);
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    });

// Returns the value to store in the DB.
// Cloudinary: file.path is the full https:// URL.
// Disk: build the relative path.
function getImagePath(file, subfolder) {
  if (!file) return null;
  if (useCloud) return file.path;
  return `uploads/${subfolder}/${file.filename}`;
}

const uploadItem = multer({
  storage: itemStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('image');

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('avatar');

module.exports = { uploadItem, uploadAvatar, getImagePath };
