const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Upload middleware evolved from simple local storage to complex Cloudinary setup

// Local storage for property images
const localUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
}

// const upload = multer({ 
//   dest: 'uploads/',
//   limits: { fileSize: 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPG and PNG allowed'), false);
//     }
//   }
// });

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localUploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
        // TODO: maybe add user ID prefix for better organization
    }
});


const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rentspot-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Main with face detection(From api document)It’d be a waste not to use it.
      { width: 100, height: 100, crop: 'fill', gravity: 'face', quality: 'auto', format: 'webp' } // Thumbnail
    ]
  }
});

// const avatarStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'rentspot-avatars',
//     allowed_formats: ['jpg', 'jpeg', 'png'],
//     transformation: [
//       { width: 300, height: 300, crop: 'fill' }
//     ]
//   }
// });
//
// const avatarUpload = multer({
//   storage: multer.diskStorage({
//     destination: 'uploads/avatars/',
//     filename: (req, file, cb) => {
//       cb(null, req.user.id + '-avatar' + path.extname(file.originalname));
//     }
//   }),
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only images allowed'), false);
//     }
//   }
// }).single('avatar');

// Cloudinary storage for properties with optimization
const propertyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rentspot-properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' } // Auto quality optimization
    ]
  }
});

// Image filter function
// FIXME: should probably add more specific MIME type checking
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// const singlePropertyUpload = multer({
//   storage: multer.diskStorage({
//     destination: 'uploads/properties/',
//     filename: (req, file, cb) => {
//       const propertyId = req.body.propertyId || 'temp';
//       cb(null, propertyId + '-main' + path.extname(file.originalname));
//     }
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'), false);
//     }
//   }
// }).single('propertyImage');

// Upload configs for different use cases
// File size limits for different use cases
const uploadConfigs = {
  // Local upload (fallback option)
  local: multer({
    storage: localStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for local storage
  }),
  
  // Avatar upload with face detection
  avatar: multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for avatar files
  }),
  
  // Property upload with optimization
  property: multer({
    storage: propertyStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB for high quality property photos
  })
};

// Export middleware functions for different endpoints
module.exports = {
  // Single uploads (original implementation)
  uploadLocal: uploadConfigs.local.single('image'),
  uploadAvatar: uploadConfigs.avatar.single('avatar'),
  uploadProperty: uploadConfigs.property.single('image'),
  
  // Multiple uploads (added later for property galleries)
  uploadMultipleLocal: uploadConfigs.local.array('images', 10), // 10 image limit
  uploadMultipleProperty: uploadConfigs.property.array('images', 10),
  
  // Raw configs for custom middleware usage
  configs: uploadConfigs
};

// TODO: add rate limiting for upload endpoints to prevent abuse
// TODO: implement image compression before Cloudinary upload