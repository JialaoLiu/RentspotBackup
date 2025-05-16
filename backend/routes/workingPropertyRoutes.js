const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');
const path = require('path');

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
    const property = mockProperties.find(p => p.id === id);
    
    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json(property);
});

// PUT - Update a property
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    // Find property index
    const propertyIndex = mockProperties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
        return res.status(404).json({ message: 'Property not found' });
    }
    
    // Get existing property
    const existingProperty = mockProperties[propertyIndex];
    
    // Update property with new values, keeping existing ones if not provided
    const updatedProperty = {
        ...existingProperty,
        title: req.body.title || existingProperty.title,
        address: req.body.address || existingProperty.address,
        price: req.body.price ? parseFloat(req.body.price) : existingProperty.price,
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : existingProperty.bedrooms,
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : existingProperty.bathrooms,
        type: req.body.type !== undefined ? parseInt(req.body.type) : existingProperty.type,
        lat: req.body.lat ? parseFloat(req.body.lat) : existingProperty.lat,
        lng: req.body.lng ? parseFloat(req.body.lng) : existingProperty.lng,
        image: req.body.image || existingProperty.image,
        status: req.body.status !== undefined ? parseInt(req.body.status) : existingProperty.status,
    };
    
    // Update in mock data
    mockProperties[propertyIndex] = updatedProperty;
    
    // Return the updated property
    res.status(200).json({
        message: 'Property updated successfully',
        property: updatedProperty
    });
});

// POST - Create a new property
router.post('/', (req, res) => {
    // Validate required fields
    const { title, price, bedrooms, bathrooms, lat, lng } = req.body;
    
    if (!title || !price || !bedrooms || !bathrooms || !lat || !lng) {
        return res.status(400).json({ 
            message: 'Missing required fields',
            required: ['title', 'price', 'bedrooms', 'bathrooms', 'lat', 'lng']
        });
    }
    
    // Create a new property
    const newProperty = {
        id: Date.now(), // Use timestamp as a unique ID
        title,
        address: req.body.address || 'Address not provided',
        price: parseFloat(price),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        type: parseInt(req.body.type) || 0,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        image: req.body.image || 'https://picsum.photos/300/200?random=' + Date.now(),
        status: parseInt(req.body.status) || 0,
        owner_id: 1 // Since we don't have auth yet, use a default owner ID
    };
    
    // Add to mock data
    mockProperties.push(newProperty);
    
    // Return the created property
    res.status(201).json({
        message: 'Property created successfully',
        property: newProperty
    });
});

// DELETE - Delete a property
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    // Find property index
    const propertyIndex = mockProperties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
        return res.status(404).json({ message: 'Property not found' });
    }
    
    // Remove from mock data
    mockProperties.splice(propertyIndex, 1);
    
    // Return success message
    res.status(200).json({
        message: 'Property deleted successfully'
    });
});

// POST - Upload a property image
router.post('/upload', uploadMiddleware.single, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    // Create URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = `/uploads/${path.basename(req.file.path)}`;
    const imageUrl = baseUrl + relativePath;
    
    res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        file: req.file
    });
});

module.exports = router;