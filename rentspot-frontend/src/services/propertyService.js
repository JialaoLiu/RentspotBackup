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

// Create new property
export function createProperty(property) {
  return api.post('/properties', property)
    .then(response => response.data)
    .catch(error => {
      console.error('Failed to create property:', error);
      throw error;
    });
}

// Update property
export function updateProperty(id, property) {
  return api.put(`/properties/${id}`, property)
    .then(response => response.data)
    .catch(error => {
      console.error(`Failed to update property ${id}:`, error);
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

// Get all properties (Admin only)
export function getAllProperties() {
  return api.get('/properties/admin/all')
    .then(response => response)
    .catch(error => {
      console.error('Failed to get all properties:', error);
      throw error;
    });
}

// Get user's own properties (Landlord)
export function getMyProperties() {
  return api.get('/properties/my')
    .then(response => response)
    .catch(error => {
      console.error('Failed to get my properties:', error);
      throw error;
    });
}

// Get property statistics (Admin only)
export function getPropertyStats() {
  return api.get('/properties/admin/stats')
    .then(response => response)
    .catch(error => {
      console.error('Failed to get property stats:', error);
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

export default {
  fetchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  getAllProperties,
  getMyProperties,
  getPropertyStats

};