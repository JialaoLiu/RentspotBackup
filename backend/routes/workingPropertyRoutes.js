const express = require('express');
const router = express.Router();
const { uploadProperty, uploadMultipleProperty } = require('../middleware/uploadMiddleware');
const { authenticateToken, requireLandlord, requireAdmin } = require('../middleware/authMiddleware');
const { handleValidationError, handleNotFound, handleForbidden, handleDbError } = require('../utils/errorHandler');

// Main property routes evolved from simple CRUD to complex image handling and filtering
// Multiple image upload was added later when users wanted property galleries

// Database connection
const db = require('../config/db');

// Upload single image - requires authentication (MUST come before generic routes)
router.post('/upload', authenticateToken, uploadProperty, (req, res) => {
    if (!req.file) {
        return handleValidationError(res, 'No image uploaded');
    }
    
    // For Cloudinary uploads, the URL is in req.file.path
    const imageUrl = req.file.path || req.file.secure_url;
    
    // const imageUrl = `/uploads/${req.file.filename}`;
    // res.json({ message: 'Image uploaded', imageUrl });
    
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

// Upload multiple images for a property - requires authentication with error handling
router.post('/upload-multiple', authenticateToken, (req, res, next) => {
    uploadMultipleProperty(req, res, (err) => {
        if (err) {
            // Handle multer errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: 'error',
                    message: 'One or more files are too large. Maximum size per file is 10MB.'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Too many files. Maximum 10 images allowed.'
                });
            }
            if (err.message === 'Only image files are allowed!') {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }
            // Other errors
            return res.status(500).json({
                status: 'error',
                message: 'Error uploading files: ' + err.message
            });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return handleValidationError(res, 'No images uploaded');
        }
        
        const { propertyId } = req.body;
        
        if (!propertyId) {
            return handleValidationError(res, 'Property ID is required');
        }
        
        // Verify property exists and user owns it (or is admin)
        const [properties] = await db.query(
            'SELECT property_owner_id FROM Property WHERE property_id = ?',
            [propertyId]
        );
        
        if (!properties || properties.length === 0) {
            return handleNotFound(res, 'Property');
        }
        
        // Check ownership (unless admin)
        if (req.user.user_role !== 2 && properties[0].property_owner_id !== req.user.user_id) {
            return handleForbidden(res, 'You can only upload images to your own properties');
        }
        
        // Get current max order_index for this property
        const [maxOrder] = await db.query(
            'SELECT COALESCE(MAX(order_index), 0) as max_order FROM PropertyImage WHERE property_id = ?',
            [propertyId]
        );
        let nextOrder = (maxOrder[0]?.max_order || 0) + 1;
        
        // Insert each image into PropertyImage table
        const uploadedImages = [];
        
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const imageUrl = file.path || file.secure_url;
            
            
            // Set first image as primary if no primary exists
            const [primaryExists] = await db.query(
                'SELECT COUNT(*) as count FROM PropertyImage WHERE property_id = ? AND is_primary = 1',
                [propertyId]
            );
            const isPrimary = primaryExists[0].count === 0 && i === 0 ? 1 : 0;
            
            const [result] = await db.query(
                'INSERT INTO PropertyImage (property_id, image_url, is_primary, order_index) VALUES (?, ?, ?, ?)',
                [propertyId, imageUrl, isPrimary, nextOrder + i]
            );
            
            
            uploadedImages.push({
                id: result.insertId,
                url: imageUrl,
                isPrimary: isPrimary,
                orderIndex: nextOrder + i,
                cloudinaryId: file.public_id,
                originalname: file.originalname
            });
        }
        
        res.json({
            message: 'Images uploaded successfully',
            images: uploadedImages,
            count: uploadedImages.length
        });
        
    } catch (error) {
        handleDbError(res, error, 'uploading images');
    }
});

// Get all properties
router.get('/', async (req, res) => {
    try {
        // Execute query with LEFT JOIN to get primary image
        const [properties] = await db.query(`
            SELECT 
                p.property_id AS id, p.property_owner_id AS owner_id, 
                p.property_name AS title, p.property_price AS price, 
                p.property_room AS bedrooms, p.property_bathroom AS bathrooms, 
                p.property_garages AS garages, p.property_aircon AS aircon, 
                p.property_balcony AS balcony, p.property_petsconsidered AS petsConsidered, 
                p.property_furnished AS furnished, p.property_type AS type, 
                p.property_status AS status, p.property_latitude AS lat, 
                p.property_longitude AS lng, 
                COALESCE(p.property_address, CONCAT('Adelaide SA ', p.property_id)) AS address,
                COALESCE(pi.image_url, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png') AS image
            FROM Property p
            LEFT JOIN PropertyImage pi ON p.property_id = pi.property_id AND pi.is_primary = 1
            WHERE p.property_status = 0
            ORDER BY p.property_id DESC
        `);
        
        if (properties && properties.length > 0) {
            res.json({
                properties: properties,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: properties.length,
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

// Favorite routes - MUST be before /:id route
// Check if property is favorited - requires authentication
router.get('/:id/favorite', authenticateToken, async (req, res) => {
    const propertyId = parseInt(req.params.id);
    const userId = req.user.user_id || req.user.id;
    
    try {
        const [favorites] = await db.query(
            'SELECT favorite_id FROM Favorite WHERE favorite_user_id = ? AND favorite_property_id = ?',
            [userId, propertyId]
        );
        
        res.json({
            favorited: favorites && favorites.length > 0
        });
        
    } catch (error) {
        handleDbError(res, error, 'checking favorite status');
    }
});

// Add property to favorites - requires authentication
router.post('/:id/favorite', authenticateToken, async (req, res) => {
    const propertyId = parseInt(req.params.id);
    const userId = req.user.user_id || req.user.id;
    
    try {
        // Check if property exists
        const [properties] = await db.query(
            'SELECT property_id FROM Property WHERE property_id = ?',
            [propertyId]
        );
        
        if (!properties || properties.length === 0) {
            return handleNotFound(res, 'Property');
        }
        
        // Check if already favorited
        const [existing] = await db.query(
            'SELECT favorite_id FROM Favorite WHERE favorite_user_id = ? AND favorite_property_id = ?',
            [userId, propertyId]
        );
        
        if (existing && existing.length > 0) {
            return handleValidationError(res, 'Property already in favorites');
        }
        
        // Add to favorites
        await db.query(
            'INSERT INTO Favorite (favorite_user_id, favorite_property_id, favorite_saved_at) VALUES (?, ?, NOW())',
            [userId, propertyId]
        );
        
        res.json({
            message: 'Property added to favorites',
            favorited: true
        });
        
    } catch (error) {
        handleDbError(res, error, 'adding favorite');
    }
});

// Remove property from favorites - requires authentication
router.delete('/:id/favorite', authenticateToken, async (req, res) => {
    const propertyId = parseInt(req.params.id);
    const userId = req.user.user_id || req.user.id;
    
    try {
        // Check if favorite exists
        const [existing] = await db.query(
            'SELECT favorite_id FROM Favorite WHERE favorite_user_id = ? AND favorite_property_id = ?',
            [userId, propertyId]
        );
        
        if (!existing || existing.length === 0) {
            return handleNotFound(res, 'Favorite');
        }
        
        // Remove from favorites
        await db.query(
            'DELETE FROM Favorite WHERE favorite_user_id = ? AND favorite_property_id = ?',
            [userId, propertyId]
        );
        
        res.json({
            message: 'Property removed from favorites',
            favorited: false
        });
        
    } catch (error) {
        handleDbError(res, error, 'removing favorite');
    }
});

// Get properties for logged-in landlord (MUST come before /:id route)
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
                p.property_longitude AS lng, 
                COALESCE(p.property_address, CONCAT('Adelaide SA ', p.property_id)) AS address,
                COALESCE(pi.image_url, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png') AS image
            FROM Property p
            LEFT JOIN PropertyImage pi ON p.property_id = pi.property_id AND pi.is_primary = 1
            WHERE p.property_owner_id = ?
            ORDER BY p.property_id DESC
        `, [req.user.user_id]);
        
        res.json({
            properties: properties,
            total: properties.length
        });
    } catch (error) {
        handleDbError(res, error, 'fetching user properties');
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
                p.property_longitude AS lng, 
                COALESCE(p.property_address, CONCAT('Adelaide SA ', p.property_id)) AS address,
                COALESCE(
                    (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1),
                    (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id ORDER BY order_index ASC LIMIT 1),
                    p.property_img_url
                ) AS image,
                u.user_name AS owner_name, u.user_email AS owner_email, u.user_phone AS owner_phone
            FROM Property p
            LEFT JOIN User u ON p.property_owner_id = u.user_id
            WHERE p.property_id = ?
        `, [id]);
        
        if (properties && properties.length > 0) {
            const property = properties[0];
            
            // Get all images for this property
            const [images] = await db.query(
                'SELECT image_url FROM PropertyImage WHERE property_id = ? ORDER BY order_index ASC',
                [id]
            );
            
            // Add images array to response
            property.images = images.map(img => img.image_url);
            
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
        if (req.body.address) {
            updates.push('property_address = ?');
            values.push(req.body.address);
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
    const { title, price, bedrooms, bathrooms, lat, lng, address } = req.body;
    
    if (!title || !price || !bedrooms || !bathrooms || !lat || !lng || !address) {
        return handleValidationError(res, 'Missing required fields: title, price, bedrooms, bathrooms, lat, lng, address');
    }
    
    try {
        // Insert new property without property_img_url
        const [result] = await db.query(
            `INSERT INTO Property (
                property_owner_id, property_name, property_price, 
                property_room, property_bathroom, property_garages,
                property_aircon, property_balcony, property_petsconsidered,
                property_furnished, property_type, property_status,
                property_latitude, property_longitude, property_address
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
                address
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

// Get property images
router.get('/:id/images', async (req, res) => {
    const propertyId = parseInt(req.params.id);
    
    if (isNaN(propertyId)) {
        return handleValidationError(res, 'Invalid property ID');
    }
    
    try {
        const [images] = await db.query(
            'SELECT image_id, image_url, is_primary, order_index FROM PropertyImage WHERE property_id = ? ORDER BY order_index ASC',
            [propertyId]
        );
        
        res.json({
            images: images,
            count: images.length
        });
    } catch (error) {
        handleDbError(res, error, 'fetching property images');
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
                p.property_longitude AS lng, 
                COALESCE(p.property_address, CONCAT('Adelaide SA ', p.property_id)) AS address,
                COALESCE(pi.image_url, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png') AS image,
                u.user_name AS owner_name, u.user_email AS owner_email
            FROM Property p
            LEFT JOIN User u ON p.property_owner_id = u.user_id
            LEFT JOIN PropertyImage pi ON p.property_id = pi.property_id AND pi.is_primary = 1
            ORDER BY p.property_id DESC
        `);
        
        res.json({
            properties: properties,
            total: properties.length
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