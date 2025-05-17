const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const PropertyImage = require('../models/propertyImage');

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

// Upload multiple images
router.post('/upload/multiple', uploadMiddleware.multiple, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = req.files.map(file => {
        const imagePath = `/uploads/${path.basename(file.path)}`;
        return {
            url: baseUrl + imagePath,
            filename: file.filename
        };
    });
    
    res.json({
        message: 'Images uploaded',
        images: imageUrls
    });
});

// Get property images
router.get('/:propertyId/images', async (req, res) => {
    try {
        const propertyId = parseInt(req.params.propertyId);
        
        if (isNaN(propertyId)) {
            return res.status(400).json({ message: 'Invalid property ID' });
        }
        
        // Get property from mock data
        const property = mockProperties.find(p => p.id === propertyId);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Generate mock images
        const images = [
            {
                id: 1,
                propertyId: propertyId,
                url: property.image,
                isPrimary: true,
                orderIndex: 0
            },
            {
                id: 2,
                propertyId: propertyId,
                url: `https://picsum.photos/300/200?random=${propertyId}-2`,
                isPrimary: false,
                orderIndex: 1
            },
            {
                id: 3,
                propertyId: propertyId,
                url: `https://picsum.photos/300/200?random=${propertyId}-3`,
                isPrimary: false,
                orderIndex: 2
            }
        ];
        
        res.json(images);
    } catch (error) {
        console.error('Error getting images:', error);
        res.status(500).json({ message: 'Error getting property images' });
    }
});

// Add property image
router.post('/:propertyId/images', uploadMiddleware.single, async (req, res) => {
    try {
        const propertyId = parseInt(req.params.propertyId);
        
        if (isNaN(propertyId)) {
            return res.status(400).json({ message: 'Invalid property ID' });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        
        const property = mockProperties.find(p => p.id === propertyId);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imagePath = `/uploads/${path.basename(req.file.path)}`;
        const imageUrl = baseUrl + imagePath;
        
        // Create new image mock
        const newImage = {
            id: Date.now(),
            propertyId: propertyId,
            url: imageUrl,
            isPrimary: req.body.isPrimary === 'true',
            orderIndex: parseInt(req.body.orderIndex) || 0
        };
        
        res.status(201).json({
            message: 'Image added to property',
            image: newImage
        });
    } catch (error) {
        console.error('Error adding image:', error);
        res.status(500).json({ message: 'Error adding image' });
    }
});

// Set primary image
router.put('/:propertyId/images/:imageId/primary', async (req, res) => {
    try {
        const propertyId = parseInt(req.params.propertyId);
        const imageId = parseInt(req.params.imageId);
        
        if (isNaN(propertyId) || isNaN(imageId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }
        
        const property = mockProperties.find(p => p.id === propertyId);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Mock setting primary image
        res.json({
            message: 'Image set as primary',
            propertyId,
            imageId
        });
    } catch (error) {
        console.error('Error setting primary image:', error);
        res.status(500).json({ message: 'Error setting primary image' });
    }
});

// Delete image
router.delete('/:propertyId/images/:imageId', async (req, res) => {
    try {
        const propertyId = parseInt(req.params.propertyId);
        const imageId = parseInt(req.params.imageId);
        
        if (isNaN(propertyId) || isNaN(imageId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }
        
        const property = mockProperties.find(p => p.id === propertyId);
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        // Mock deleting image
        res.json({
            message: 'Image deleted',
            propertyId,
            imageId
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
});

module.exports = router;