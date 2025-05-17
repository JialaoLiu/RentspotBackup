const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');
const path = require('path');

// Sample property data
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

// Get all properties
router.get('/', (req, res) => {
    console.log('Getting properties list');
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

// Get one property
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const property = mockProperties.find(p => p.id === id);
    
    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json(property);
});

// Update property
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockProperties.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Property not found' });
    }
    
    // Update property
    const old = mockProperties[index];
    const updated = {
        ...old,
        title: req.body.title || old.title,
        address: req.body.address || old.address,
        price: req.body.price ? parseFloat(req.body.price) : old.price,
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : old.bedrooms,
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : old.bathrooms,
        type: req.body.type !== undefined ? parseInt(req.body.type) : old.type,
        lat: req.body.lat ? parseFloat(req.body.lat) : old.lat,
        lng: req.body.lng ? parseFloat(req.body.lng) : old.lng,
        image: req.body.image || old.image,
        status: req.body.status !== undefined ? parseInt(req.body.status) : old.status,
    };
    
    mockProperties[index] = updated;
    
    res.json({
        message: 'Property updated',
        property: updated
    });
});

// Create property
router.post('/', (req, res) => {
    // Check required fields
    const { title, price, bedrooms, bathrooms, lat, lng } = req.body;
    
    if (!title || !price || !bedrooms || !bathrooms || !lat || !lng) {
        return res.status(400).json({ 
            message: 'Missing required fields',
            required: ['title', 'price', 'bedrooms', 'bathrooms', 'lat', 'lng']
        });
    }
    
    // New property
    const newProperty = {
        id: Date.now(),
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
        owner_id: 1
    };
    
    mockProperties.push(newProperty);
    
    res.status(201).json({
        message: 'Property created',
        property: newProperty
    });
});

// Delete property
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockProperties.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Property not found' });
    }
    
    mockProperties.splice(index, 1);
    
    res.json({ message: 'Property deleted' });
});

// Upload image
router.post('/upload', uploadMiddleware.single, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imagePath = `/uploads/${path.basename(req.file.path)}`;
    const imageUrl = baseUrl + imagePath;
    
    res.json({
        message: 'Image uploaded',
        imageUrl: imageUrl,
        file: req.file
    });
});

module.exports = router;