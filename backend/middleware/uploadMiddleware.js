const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Local storage for property images
const localUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localUploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

// Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rentspot-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Main
      { width: 100, height: 100, crop: 'fill', gravity: 'face', quality: 'auto', format: 'webp' } // Thumb
    ]
  }
});

// Cloudinary storage for properties
const propertyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rentspot-properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' }
    ]
  }
});

// Image filter
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Upload configs
const uploadConfigs = {
  // Local upload
  local: multer({
    storage: localStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }),
  
  // Avatar upload
  avatar: multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB - increased from 2MB
  }),
  
  // Property upload
  property: multer({
    storage: propertyStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  })
};

// Export middleware functions
module.exports = {
  // Single uploads
  uploadLocal: uploadConfigs.local.single('image'),
  uploadAvatar: uploadConfigs.avatar.single('avatar'),
  uploadProperty: uploadConfigs.property.single('image'),
  
  // Multiple uploads
  uploadMultipleLocal: uploadConfigs.local.array('images', 10),
  uploadMultipleProperty: uploadConfigs.property.array('images', 10),
  
  // Raw configs for custom use
  configs: uploadConfigs
};