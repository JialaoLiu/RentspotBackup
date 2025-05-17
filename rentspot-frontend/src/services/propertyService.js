import api from './apiService';

// Get all properties
export function fetchProperties(filters = {}) {
  return api.get('/properties', { params: filters })
    .then(response => {
      console.log('API response:', response.data);
      // Handle different response formats
      if (response.data && response.data.properties) {
        return response.data.properties;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        return getMockProperties().properties;
      }
    })
    .catch(error => {
      console.error('Failed to get properties:', error);
      // Use mock data as fallback
      return getMockProperties().properties;
    });
}

// Get property by ID
export function getPropertyById(id) {
  return api.get(`/properties/${id}`)
    .then(response => {
      console.log(`Got property ${id}:`, response.data);
      return response.data;
    })
    .catch(error => {
      console.error(`Failed to get property ${id}:`, error);
      // Use mock data as fallback
      const mockProperty = getMockPropertyById(id);
      console.log(`Using mock data:`, mockProperty);
      return mockProperty;
    });
}

// Create property
export function createProperty(property, imageFiles = []) {
  // Handle images if provided
  let createPromise;
  
  if (imageFiles && imageFiles.length > 0) {
    createPromise = uploadMultipleImages(imageFiles)
      .then(uploadResult => {
        const images = uploadResult.images.map(img => img.url);
        return api.post('/properties', {
          ...property,
          images: images,
          primaryImage: images[0] // Set first as primary
        });
      });
  } else {
    createPromise = api.post('/properties', property);
  }
  
  return createPromise
    .then(response => response.data)
    .catch(error => {
      console.error('Failed to create property:', error);
      throw error;
    });
}

// Update property
export function updateProperty(id, property, imageFiles = [], replaceAllImages = false) {
  // Handle images if provided
  let updatePromise;
  
  if (imageFiles && imageFiles.length > 0) {
    updatePromise = uploadMultipleImages(imageFiles)
      .then(uploadResult => {
        const images = uploadResult.images.map(img => img.url);
        return api.put(`/properties/${id}`, {
          ...property,
          images: images,
          replaceAllImages: replaceAllImages,
          primaryImage: property.setPrimaryImage ? images[0] : undefined
        });
      });
  } else {
    updatePromise = api.put(`/properties/${id}`, property);
  }
  
  return updatePromise
    .then(response => response.data)
    .catch(error => {
      console.error(`Failed to update property:`, error);
      throw error;
    });
}

// Delete property
export function deleteProperty(id) {
  return api.delete(`/properties/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Failed to delete property ${id}:`, error);
      throw error;
    });
}

// Upload property image
export function uploadPropertyImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  return api.post('/properties/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Failed to upload image:', error);
    throw error;
  });
}

// Upload multiple images
export function uploadMultipleImages(files) {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('images', file);
  });
  
  return api.post('/properties/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Failed to upload images:', error);
    throw error;
  });
}

// Get property images
export function getPropertyImages(propertyId) {
  return api.get(`/properties/${propertyId}/images`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Failed to get images for property ${propertyId}:`, error);
      return getMockPropertyImages(propertyId);
    });
}

// Set primary image
export function setPrimaryImage(propertyId, imageId) {
  return api.put(`/properties/${propertyId}/images/${imageId}/primary`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Failed to set primary image:`, error);
      throw error;
    });
}

// Delete image
export function deletePropertyImage(propertyId, imageId) {
  return api.delete(`/properties/${propertyId}/images/${imageId}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Failed to delete image:`, error);
      throw error;
    });
}

// Add images to property
export function addImagesToProperty(propertyId, files) {
  const formData = new FormData();
  formData.append('propertyId', propertyId);
  
  files.forEach(file => {
    formData.append('images', file);
  });
  
  return api.post('/properties/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error(`Failed to add images:`, error);
    throw error;
  });
}

// Mock data for development
function getMockProperties() {
  const mockProperties = [
    {
      id: 101,
      title: 'Modern 2-Bed Apartment in CBD',
      address: '15 Grote St, Adelaide SA',
      price: 620,
      bedrooms: 2,
      bathrooms: 1,
      type: 1,
      lat: -34.92846,
      lng: 138.59593,
      image: 'https://picsum.photos/300/200?random=101',
      status: 0
    },
    {
      id: 102,
      title: 'Spacious Family House -- North Adelaide',
      address: '18 Jeffcott St, North Adelaide SA',
      price: 890,
      bedrooms: 4,
      bathrooms: 2,
      type: 0,
      lat: -34.90571,
      lng: 138.59544,
      image: 'https://picsum.photos/300/200?random=102',
      status: 0
    },
    {
      id: 103,
      title: 'Cozy Studio near University',
      address: '5 Frome Road, Adelaide SA',
      price: 380,
      bedrooms: 1,
      bathrooms: 1,
      type: 1,
      lat: -34.92146,
      lng: 138.60745,
      image: 'https://picsum.photos/300/200?random=103',
      status: 0
    }
  ];

  return {
    properties: mockProperties,
    pagination: {
      page: 1,
      limit: 10,
      total: mockProperties.length,
      pages: 1
    }
  };
}

function getMockPropertyById(id) {
  const properties = getMockProperties().properties;
  return properties.find(p => p.id === parseInt(id)) || null;
}

function getMockPropertyImages(propertyId) {
  const property = getMockPropertyById(propertyId);
  if (!property) return [];
  
  // Generate mock images for the property
  return [
    {
      id: 1,
      propertyId: parseInt(propertyId),
      url: property.image,
      isPrimary: true,
      orderIndex: 0
    },
    {
      id: 2,
      propertyId: parseInt(propertyId),
      url: `https://picsum.photos/300/200?random=${propertyId}-2`,
      isPrimary: false,
      orderIndex: 1
    },
    {
      id: 3,
      propertyId: parseInt(propertyId),
      url: `https://picsum.photos/300/200?random=${propertyId}-3`,
      isPrimary: false,
      orderIndex: 2
    }
  ];
}

export default {
  fetchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  uploadMultipleImages,
  getPropertyImages,
  setPrimaryImage,
  deletePropertyImage,
  addImagesToProperty
};