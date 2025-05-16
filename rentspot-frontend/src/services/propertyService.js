/**
 * Get a property by ID
 * @param {number} id - Property ID
 * @returns {Promise} - Property details
 */
export function getPropertyById(id) {
  return api.get(`/properties/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Error fetching property ${id}:`, error);
      // Return mock property in case of error (for development)
      return getMockPropertyById(id);
    });
}

/**
 * Get mock properties (as fallback)
 * @returns {Object} - Mock properties data
 */
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

/**
 * Get a mock property by ID (as fallback)
 * @param {number} id - Property ID
 * @returns {Object|null} - Mock property or null if not found
 */
function getMockPropertyById(id) {
  const properties = getMockProperties().properties;
  return properties.find(p => p.id === parseInt(id)) || null;
}

// The upload functions will be added in a later step when Cloudinary is fully integrated
export default {
  fetchProperties,
  getPropertyById
};