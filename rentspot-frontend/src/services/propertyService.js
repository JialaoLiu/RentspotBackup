import api from './apiService';

// Get all properties
export function fetchProperties(filters = {}) {
  return api.get('/properties', { params: filters })
    .then(response => {
      // Got properties
      // Handle different response formats
      if (response.data && response.data.properties) {
        return response.data.properties;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        // Unexpected format
        return getMockProperties().properties;
      }
    })
    .catch(error => {
      // API failed
      // Use mock data as fallback
      return getMockProperties().properties;
    });
}

// Get property by ID
export function getPropertyById(id) {
  return api.get(`/properties/${id}`)
    .then(response => {
      // Got property
      return response.data;
    })
    .catch(error => {
      // Property not found
      // Use mock data as fallback
      const mockProperty = getMockPropertyById(id);
      // Using mock
      return mockProperty;
    });
}

// Create new property
export function createProperty(property) {
  return api.post('/properties', property)
    .then(response => response.data)
    .catch(error => {
      // Create failed
      throw error;
    });
}

// Update property
export function updateProperty(id, property) {
  return api.put(`/properties/${id}`, property)
    .then(response => response.data)
    .catch(error => {
      // Update failed
      throw error;
    });
}

// Delete property
export function deleteProperty(id) {
  return api.delete(`/properties/${id}`)
    .then(response => response.data)
    .catch(error => {
      // Delete failed
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
    // Upload failed
    throw error;
  });
}

// Upload multiple property images
export function uploadMultiplePropertyImages(files, propertyId) {
  const formData = new FormData();
  
  // Append property ID
  formData.append('propertyId', propertyId);
  
  // Append each file to the form data
  files.forEach(file => {
    formData.append('images', file);
  });

  return api.post('/properties/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => response.data)
  .catch(error => {
    // Upload failed
    throw error;
  });
}

// Get all properties (Admin only)
export function getAllProperties() {
  return api.get('/properties/admin/all')
    .then(response => response)
    .catch(error => {
      // Get all failed
      throw error;
    });
}

// Get user's own properties (Landlord)
export function getMyProperties() {
  return api.get('/properties/my')
    .then(response => response)
    .catch(error => {
      // Get mine failed
      throw error;
    });
}

// Get property statistics (Admin only)
export function getPropertyStats() {
  return api.get('/properties/admin/stats')
    .then(response => response)
    .catch(error => {
      // Stats failed
      throw error;
    });
}

// Add property to favorites
export function addFavorite(propertyId) {
  return api.post(`/properties/${propertyId}/favorite`)
    .then(response => response.data)
    .catch(error => {
      // Add favorite failed
      throw error;
    });
}

// Remove property from favorites
export function removeFavorite(propertyId) {
  return api.delete(`/properties/${propertyId}/favorite`)
    .then(response => response.data)
    .catch(error => {
      // Remove favorite failed
      throw error;
    });
}

// Check if property is favorited
export function checkFavorite(propertyId) {
  return api.get(`/properties/${propertyId}/favorite`)
    .then(response => response.data.favorited)
    .catch(error => {
      // Check failed
      return false;
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
      image: 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png',
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
      image: 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png',
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
      image: 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png',
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

export default {
  fetchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  getAllProperties,
  getMyProperties,
  getPropertyStats,
  addFavorite,
  removeFavorite,
  checkFavorite
};