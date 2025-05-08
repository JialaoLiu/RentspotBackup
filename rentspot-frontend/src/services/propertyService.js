// src/services/propertyService.js

// Mock data to use while backend API is not available
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
      status: 0,
      owner_id: 3
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
      status: 0,
      owner_id: 2
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
      status: 0,
      owner_id: 1
    }
  ];

  export function fetchProperties() {
    // You can replace this with a real API call when ready
    // e.g., return fetch('/api/properties').then(res => res.json());
    return Promise.resolve(mockProperties);
  }

  export function getPropertyById(id) {
    // Similarly, replace with a real API call when ready
    const property = mockProperties.find((p) => p.id === parseInt(id, 10));
    return Promise.resolve(property || null);
  }