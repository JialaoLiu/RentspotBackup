const express = require('express');
const router = express.Router();
const { uploadProperty } = require('../middleware/uploadMiddleware');
const { authenticateToken, requireLandlord, requireAdmin } = require('../middleware/authMiddleware');
const { handleValidationError, handleNotFound, handleForbidden, handleDbError } = require('../utils/errorHandler');

// Sample property data - commented out, using database data instead
/*
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
*/

// Empty backup
const mockProperties = [];

// Database connection
const db = require('../config/db');

// Get all properties
router.get('/', async (req, res) => {
    console.log('Getting properties');
    try {
        // Execute query
        const [properties] = await db.query(`
            SELECT 
                property_id AS id, property_owner_id AS owner_id, 
                property_name AS title, property_price AS price, 
                property_room AS bedrooms, property_bathroom AS bathrooms, 
                property_garages AS garages, property_aircon AS aircon, 
                property_balcony AS balcony, property_petsconsidered AS petsConsidered, 
                property_furnished AS furnished, property_type AS type, 
                property_status AS status, property_latitude AS lat, 
                property_longitude AS lng, property_img_url AS image
            FROM Property
            WHERE property_status = 0
            ORDER BY property_id DESC
        `);
        
        if (properties && properties.length > 0) {
            // Add mock address
            const props = properties.map(p => ({
                ...p,
                address: `Adelaide SA ${p.id}`
            }));
            
            res.json({
                properties: props,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: props.length,
                    pages: 1
                }
            });
        } else {
            res.json({
                properties: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 1 }
            });
        }
    } catch (error) {
        handleDbError(res, error, 'fetching properties');
    }
});

// get property by id
router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        // query with owner
        const [properties] = await db.query(`
            SELECT 
                p.property_id AS id, p.property_owner_id AS owner_id, 
                p.property_name AS title, p.property_price AS price, 
                p.property_room AS bedrooms, p.property_bathroom AS bathrooms, 
                p.property_garages AS garages, p.property_aircon AS aircon, 
                p.property_balcony AS balcony, p.property_petsconsidered AS petsConsidered, 
                p.property_furnished AS furnished, p.property_type AS type, 
                p.property_status AS status, p.property_latitude AS lat, 
                p.property_longitude AS lng, p.property_img_url AS image,
                u.user_name AS owner_name, u.user_email AS owner_email, u.user_phone AS owner_phone
            FROM Property p
            LEFT JOIN User u ON p.property_owner_id = u.user_id
            WHERE p.property_id = ?
        `, [id]);
        
        if (properties && properties.length > 0) {
            const property = {
                ...properties[0],
                address: `Adelaide SA ${properties[0].id}`
            };
            
            res.json(property);
        } else {
            return handleNotFound(res, 'Property');
        }
    } catch (error) {
        return handleDbError(res, error, 'fetching property');
    }
});

// Update property - requires landlord or admin
router.put('/:id', requireLandlord, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        // First check if property exists and get owner
        const [properties] = await db.query(
            'SELECT property_owner_id FROM Property WHERE property_id = ?',
            [id]
        );
        
        if (!properties || properties.length === 0) {
            return handleNotFound(res, 'Property');
        }
        
        // Check if user owns the property (unless admin)
        if (req.user.user_role !== 2 && properties[0].property_owner_id !== req.user.user_id) {
            return handleForbidden(res, 'You can only update your own properties.');
        }
        
        // Build update query dynamically
        const updates = [];
        const values = [];
        
        if (req.body.title) {
            updates.push('property_name = ?');
            values.push(req.body.title);
        }
        if (req.body.price) {
            updates.push('property_price = ?');
            values.push(parseFloat(req.body.price));
        }
        if (req.body.bedrooms) {
            updates.push('property_room = ?');
            values.push(parseInt(req.body.bedrooms));
        }
        if (req.body.bathrooms) {
            updates.push('property_bathroom = ?');
            values.push(parseInt(req.body.bathrooms));
        }
        if (req.body.type !== undefined) {
            updates.push('property_type = ?');
            values.push(parseInt(req.body.type));
        }
        if (req.body.lat) {
            updates.push('property_latitude = ?');
            values.push(parseFloat(req.body.lat));
        }
        if (req.body.lng) {
            updates.push('property_longitude = ?');
            values.push(parseFloat(req.body.lng));
        }
        if (req.body.image) {
            updates.push('property_img_url = ?');
            values.push(req.body.image);
        }
        if (req.body.status !== undefined) {
            updates.push('property_status = ?');
            values.push(parseInt(req.body.status));
        }
        
        if (updates.length === 0) {
            return handleValidationError(res, 'No fields to update');
        }
        
        values.push(id);
        
        await db.query(
            `UPDATE Property SET ${updates.join(', ')} WHERE property_id = ?`,
            values
        );
        
        res.json({
            message: 'Property updated successfully'
        });
        
    } catch (error) {
        handleDbError(res, error, 'updating property');
    }
});

// Create property - requires landlord or admin
router.post('/', requireLandlord, async (req, res) => {
    // Check required fields
    const { title, price, bedrooms, bathrooms, lat, lng } = req.body;
    
    if (!title || !price || !bedrooms || !bathrooms || !lat || !lng) {
        return handleValidationError(res, 'Missing required fields: title, price, bedrooms, bathrooms, lat, lng');
    }
    
    try {
        // Insert new property
        const [result] = await db.query(
            `INSERT INTO Property (
                property_owner_id, property_name, property_price, 
                property_room, property_bathroom, property_garages,
                property_aircon, property_balcony, property_petsconsidered,
                property_furnished, property_type, property_status,
                property_latitude, property_longitude, property_img_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.user_id, // Owner is the authenticated user
                title,
                parseFloat(price),
                parseInt(bedrooms),
                parseInt(bathrooms),
                parseInt(req.body.garages) || 0,
                parseInt(req.body.aircon) || 0,
                parseInt(req.body.balcony) || 0,
                parseInt(req.body.petsConsidered) || 0,
                parseInt(req.body.furnished) || 0,
                parseInt(req.body.type) || 0,
                0, // Status: Available
                parseFloat(lat),
                parseFloat(lng),
                req.body.image || 'https://picsum.photos/300/200?random=' + Date.now()
            ]
        );
        
        res.status(201).json({
            message: 'Property created successfully',
            propertyId: result.insertId
        });
        
    } catch (error) {
        handleDbError(res, error, 'creating property');
    }
});

// Delete property - requires landlord or admin
router.delete('/:id', requireLandlord, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        // First check if property exists and get owner and status
        const [properties] = await db.query(
            'SELECT property_owner_id, property_status FROM Property WHERE property_id = ?',
            [id]
        );
        
        if (!properties || properties.length === 0) {
            return handleNotFound(res, 'Property');
        }
        
        // Check if user owns the property (unless admin)
        if (req.user.user_role !== 2 && properties[0].property_owner_id !== req.user.user_id) {
            return handleForbidden(res, 'You can only delete your own properties.');
        }
        
        // If property is already removed (status = 2), do permanent delete (admin only)
        if (properties[0].property_status === 2) {
            if (req.user.user_role !== 2) {
                return handleForbidden(res, 'Only administrators can permanently delete properties.');
            }
            
            // Permanent delete from database
            await db.query(
                'DELETE FROM Property WHERE property_id = ?',
                [id]
            );
            
            res.json({ message: 'Property permanently deleted' });
        } else {
            // Soft delete by setting status to 2 (Removed)
            await db.query(
                'UPDATE Property SET property_status = 2 WHERE property_id = ?',
                [id]
            );
            
            res.json({ message: 'Property removed successfully' });
        }
        
    } catch (error) {
        handleDbError(res, error, 'deleting property');
    }
});

// Upload image - requires authentication
router.post('/upload', authenticateToken, uploadProperty, (req, res) => {
    if (!req.file) {
        return handleValidationError(res, 'No image uploaded');
    }
    
    // For Cloudinary uploads, the URL is in req.file.path
    const imageUrl = req.file.path || req.file.secure_url;
    
    res.json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        cloudinaryId: req.file.public_id,
        file: {
            originalname: req.file.originalname,
            size: req.file.size,
            format: req.file.format
        }
    });
});

// Get properties for logged-in landlord
router.get('/my', requireLandlord, async (req, res) => {
    try {
        const [properties] = await db.query(`
            SELECT 
                p.property_id AS id, p.property_owner_id AS owner_id, 
                p.property_name AS title, p.property_price AS price, 
                p.property_room AS bedrooms, p.property_bathroom AS bathrooms, 
                p.property_garages AS garages, p.property_aircon AS aircon, 
                p.property_balcony AS balcony, p.property_petsconsidered AS petsConsidered, 
                p.property_furnished AS furnished, p.property_type AS type, 
                p.property_status AS status, p.property_latitude AS lat, 
                p.property_longitude AS lng, p.property_img_url AS image
            FROM Property p
            WHERE p.property_owner_id = ?
            ORDER BY p.property_id DESC
        `, [req.user.user_id]);
        
        // Add address field to each property
        const propertiesWithAddress = properties.map(p => ({
            ...p,
            address: `Adelaide SA ${p.id}`
        }));
        
        res.json({
            properties: propertiesWithAddress,
            total: propertiesWithAddress.length
        });
    } catch (error) {
        handleDbError(res, error, 'fetching user properties');
    }
});

// Admin routes
// Get all properties including removed ones - Admin only
router.get('/admin/all', requireAdmin, async (_req, res) => {
    try {
        const [properties] = await db.query(`
            SELECT 
                p.property_id AS id, p.property_owner_id AS owner_id, 
                p.property_name AS title, p.property_price AS price, 
                p.property_room AS bedrooms, p.property_bathroom AS bathrooms, 
                p.property_garages AS garages, p.property_aircon AS aircon, 
                p.property_balcony AS balcony, p.property_petsconsidered AS petsConsidered, 
                p.property_furnished AS furnished, p.property_type AS type, 
                p.property_status AS status, p.property_latitude AS lat, 
                p.property_longitude AS lng, p.property_img_url AS image,
                u.user_name AS owner_name, u.user_email AS owner_email
            FROM Property p
            LEFT JOIN User u ON p.property_owner_id = u.user_id
            ORDER BY p.property_id DESC
        `);
        
        // Add address field to each property
        const propertiesWithAddress = properties.map(p => ({
            ...p,
            address: `Adelaide SA ${p.id}`
        }));
        
        res.json({
            properties: propertiesWithAddress,
            total: propertiesWithAddress.length
        });
    } catch (error) {
        handleDbError(res, error, 'fetching all properties');
    }
});

// Get property statistics - Admin only
router.get('/admin/stats', requireAdmin, async (_req, res) => {
    try {
        const [totalProperties] = await db.query('SELECT COUNT(*) as count FROM Property');
        const [availableProperties] = await db.query('SELECT COUNT(*) as count FROM Property WHERE property_status = 0');
        const [bookedProperties] = await db.query('SELECT COUNT(*) as count FROM Property WHERE property_status = 1');
        const [removedProperties] = await db.query('SELECT COUNT(*) as count FROM Property WHERE property_status = 2');
        
        const [propertyTypes] = await db.query(`
            SELECT property_type, COUNT(*) as count 
            FROM Property 
            WHERE property_status != 2 
            GROUP BY property_type
        `);
        
        res.json({
            total: totalProperties[0].count,
            available: availableProperties[0].count,
            booked: bookedProperties[0].count,
            removed: removedProperties[0].count,
            byType: propertyTypes
        });
    } catch (error) {
        handleDbError(res, error, 'fetching statistics');
    }
});

module.exports = router;