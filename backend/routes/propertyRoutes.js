const express = require('express');
const router = express.Router();
const { handleValidationError, handleNotFound } = require('../utils/errorHandler');

// Mock data for testing
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

// GET all properties
router.get('/', (req, res) => {
    res.json({
        properties: mockProperties,
        pagination: {
            page: 1,
            limit: 10,
            total: mockProperties.length,
            pages: 1
        }
    });
});

// GET property by ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return handleValidationError(res, 'Invalid property ID');
    }
    
    const property = mockProperties.find(p => p.id === id);
    
    if (!property) {
        return handleNotFound(res, 'Property');
    }
    
    res.json(property);
});

// All other routes will be added incrementally
// POST, PUT, DELETE routes will be added later


module.exports = router;