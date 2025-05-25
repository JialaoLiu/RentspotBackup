const Property = require('../models/property');
const cloudinary = require('../config/cloudinary');

// Debug mode
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

// Property controller
const propertyController = {
  /**
   * Get all properties with filtering and pagination
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllProperties: async (req, res) => {
    // Debug mode
    if (DEBUG_MODE) {
      return res.json({
        message: 'getAllProperties works! (DEBUG MODE)',
        properties: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      });
    }
    
    try {
      // Extract filter parameters from query
      const filters = {
        keyword: req.query.keyword,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        bedrooms: req.query.minBedrooms,
        bathrooms: req.query.bathrooms,
        type: req.query.propertyTypes ? req.query.propertyTypes.split(',') : null,
        status: req.query.status !== undefined ? parseInt(req.query.status) : undefined
      };
      
      // Extract pagination parameters
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };
      
      // Get properties from model
      const result = await Property.getAll(filters, pagination);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllProperties controller:', error);
      res.status(500).json({ 
        message: 'Error fetching properties', 
        error: error.message 
      });
    }
  },
  
  /**
   * Get a single property by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getPropertyById: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
      
      const property = await Property.getById(id);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      res.status(200).json(property);
    } catch (error) {
      console.error('Error in getPropertyById controller:', error);
      res.status(500).json({ 
        message: 'Error fetching property', 
        error: error.message 
      });
    }
  },
  
  /**
   * Create a new property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createProperty: async (req, res) => {
    try {
      // Extract property data from request body
      const propertyData = {
        owner_id: req.user.id, // From JWT middleware
        title: req.body.title,
        price: req.body.price,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        garages: req.body.garages,
        aircon: req.body.aircon,
        balcony: req.body.balcony,
        petsConsidered: req.body.petsConsidered,
        furnished: req.body.furnished,
        type: req.body.type,
        status: req.body.status || 0,
        lat: req.body.lat,
        lng: req.body.lng,
        image: req.body.image // This will be the Cloudinary URL
      };
      
      // Validate required fields
      if (!propertyData.title || !propertyData.price || !propertyData.bedrooms || 
          !propertyData.bathrooms || !propertyData.lat || !propertyData.lng) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['title', 'price', 'bedrooms', 'bathrooms', 'lat', 'lng']
        });
      }
      
      // Create property in database
      const createdProperty = await Property.create(propertyData);
      
      res.status(201).json({
        message: 'Property created successfully',
        property: createdProperty
      });
    } catch (error) {
      console.error('Error in createProperty controller:', error);
      res.status(500).json({ 
        message: 'Error creating property', 
        error: error.message 
      });
    }
  },
  
  /**
   * Update an existing property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateProperty: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
      
      // Get the existing property
      const existingProperty = await Property.getById(id);
      
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user is the owner
      if (existingProperty.owner_id !== req.user.id && req.user.role !== 2) {
        return res.status(403).json({ message: 'Unauthorized: You can only update your own properties' });
      }
      
      // Prepare update data
      const updateData = {
        title: req.body.title || existingProperty.title,
        price: req.body.price || existingProperty.price,
        bedrooms: req.body.bedrooms || existingProperty.bedrooms,
        bathrooms: req.body.bathrooms || existingProperty.bathrooms,
        garages: req.body.garages !== undefined ? req.body.garages : existingProperty.garages,
        aircon: req.body.aircon !== undefined ? req.body.aircon : existingProperty.aircon,
        balcony: req.body.balcony !== undefined ? req.body.balcony : existingProperty.balcony,
        petsConsidered: req.body.petsConsidered !== undefined ? req.body.petsConsidered : existingProperty.petsConsidered,
        furnished: req.body.furnished !== undefined ? req.body.furnished : existingProperty.furnished,
        type: req.body.type !== undefined ? req.body.type : existingProperty.type,
        status: req.body.status !== undefined ? req.body.status : existingProperty.status,
        lat: req.body.lat || existingProperty.lat,
        lng: req.body.lng || existingProperty.lng,
        image: req.body.image || existingProperty.image
      };
      
      // Update the property
      const updatedProperty = await Property.update(id, updateData);
      
      res.status(200).json({
        message: 'Property updated successfully',
        property: updatedProperty
      });
    } catch (error) {
      console.error('Error in updateProperty controller:', error);
      res.status(500).json({ 
        message: 'Error updating property', 
        error: error.message 
      });
    }
  },
  
  /**
   * Delete a property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  deleteProperty: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
      
      // Get the existing property
      const existingProperty = await Property.getById(id);
      
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user is the owner
      if (existingProperty.owner_id !== req.user.id && req.user.role !== 2) {
        return res.status(403).json({ message: 'Unauthorized: You can only delete your own properties' });
      }
      
      // Delete the property
      await Property.delete(id);
      
      // Delete image from Cloudinary if exists
      if (existingProperty.image && existingProperty.image.includes('cloudinary')) {
        try {
          // Extract public_id from the URL
          const urlParts = existingProperty.image.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          
          // Delete the image from Cloudinary
          await cloudinary.uploader.destroy(`rentspot-properties/${publicId}`);
        } catch (cloudinaryErr) {
          console.error('Error deleting image from Cloudinary:', cloudinaryErr);
          // Continue with response even if Cloudinary deletion fails
        }
      }
      
      res.status(200).json({
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteProperty controller:', error);
      res.status(500).json({ 
        message: 'Error deleting property', 
        error: error.message 
      });
    }
  },
  
  /**
   * Upload a property image to Cloudinary
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      // Cloudinary already uploaded the file via middleware
      // Return the file details
      res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: req.file.path,
        publicId: req.file.filename
      });
    } catch (error) {
      console.error('Error in uploadImage controller:', error);
      res.status(500).json({ 
        message: 'Error uploading image', 
        error: error.message 
      });
    }
  },
  
  /**
   * Upload multiple property images to Cloudinary
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  uploadMultipleImages: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      // Files already uploaded to Cloudinary via middleware
      // Return the file details
      const urls = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      
      res.status(200).json({
        message: 'Images uploaded successfully',
        images: urls
      });
    } catch (error) {
      console.error('Error in uploadMultipleImages controller:', error);
      res.status(500).json({ 
        message: 'Error uploading images', 
        error: error.message 
      });
    }
  },
  
  /**
   * Get properties by owner ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getMyProperties: async (req, res) => {
    try {
      const ownerId = req.user.id; // From JWT middleware
      
      const properties = await Property.getByOwnerId(ownerId);
      
      res.status(200).json({
        properties
      });
    } catch (error) {
      console.error('Error in getMyProperties controller:', error);
      res.status(500).json({ 
        message: 'Error fetching your properties', 
        error: error.message 
      });
    }
  }
};

module.exports = propertyController;