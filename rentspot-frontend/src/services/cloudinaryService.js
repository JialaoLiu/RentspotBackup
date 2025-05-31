import api from './apiService';

/**
 * Upload a single image to Cloudinary through our backend
 * @param {File} file - The image file to upload
 * @returns {Promise} - Promise with the upload result
 */
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  return api.post('/properties/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Upload multiple images to Cloudinary through our backend
 * @param {Array<File>} files - Array of image files
 * @returns {Promise} - Promise with the upload results
 */
export const uploadMultipleImages = (files) => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('images', file);
  });
  
  return api.post('/properties/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Generate a Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getTransformedUrl = (publicId, options = {}) => {
  // Default transformations
  const defaultOptions = {
    width: 800,
    crop: 'limit',
    quality: 'auto',
    fetchFormat: 'auto'
  };
  
  // Combine default options with provided options
  const transformOptions = { ...defaultOptions, ...options };
  
  // Base URL
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzxrmtus9';
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Add transformations
  const transformations = [];
  
  if (transformOptions.width) {
    transformations.push(`w_${transformOptions.width}`);
  }
  
  if (transformOptions.height) {
    transformations.push(`h_${transformOptions.height}`);
  }
  
  if (transformOptions.crop) {
    transformations.push(`c_${transformOptions.crop}`);
  }
  
  // Always add quality and format for optimization
  transformations.push('q_auto', 'f_auto');
  
  // Add transformations to URL
  if (transformations.length > 0) {
    url += `/${transformations.join(',')}`;
  }
  
  // Add public ID
  url += `/${publicId}`;
  
  return url;
};

export default {
  uploadImage,
  uploadMultipleImages,
  getTransformedUrl
};