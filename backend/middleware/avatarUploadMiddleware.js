const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage specifically for avatars
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rentspot-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Main square avatar
      { width: 100, height: 100, crop: 'fill', gravity: 'face', quality: 'auto', format: 'webp' } // Thumbnail
    ]
  }
});

// Initialize multer upload with Cloudinary storage
const avatarUpload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars!'), false);
    }
  }
});

module.exports = avatarUpload.single('avatar');