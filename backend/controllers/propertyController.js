const Property = require('../models/property');
const cloudinary = require('../config/cloudinary');
const { handleDbError, handleValidationError, handleNotFound } = require('../utils/errorHandler');

/**
 * Property Controller
 * Handles all property-related API endpoints
 * 
 */
const propertyController = {
  /**
   * Get all properties with filtering and pagination
   * Main property listing endpoint used by homepage and search page
   */
  getAllProperties: async (req, res) => {
    try {
      // TODO: add rate limiting before this gets abused!
      // console.log('Property search request:', req.query); // useful for debugging search issues
      
      // Extract and normalize filter parameters from query string
      // Frontend sends inconsistent parameter names - need to handle both formats
      const filters = {
        keyword: req.query.keyword,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        bedrooms: req.query.minBedrooms || req.query.bedrooms, // handle both parameter names
        bathrooms: req.query.bathrooms,
        type: req.query.propertyTypes ? req.query.propertyTypes.split(',') : null,
        status: req.query.status !== undefined ? parseInt(req.query.status) : undefined
      };
      
      // Pagination handling - learned this when property list got too long
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10 // 10 is good balance between performance and UX
      };
      
      // Validate pagination limits to prevent abuse
      if (pagination.limit > 100) {
        pagination.limit = 100; // prevent users from requesting massive datasets
      }
      
      // FIXME: this query is getting slow with large datasets... needs indexing
      const result = await Property.getAll(filters, pagination);
      
      // Early version (commented out - was too simple):
      // const properties = await Property.getAll();
      // res.status(200).json({ properties });
      
      res.status(200).json(result);
    } catch (error) {
      // BUG: sometimes returns 500 on concurrent requests, investigating...
      handleDbError(res, error, 'fetching properties');
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
        return handleValidationError(res, 'Invalid property ID');
      }
      
      const property = await Property.getById(id);
      
      if (!property) {
        return handleNotFound(res, 'Property');
      }
      
      // Get property images from PropertyImage table
      const images = await Property.getImages(id);
      
      // Add images array to property object
      property.images = images.map(img => img.image_url);
      
      res.status(200).json(property);
    } catch (error) {
      handleDbError(res, error, 'fetching property');
    }
  },
  
  /**
   * Create a new property listing
   * Complex endpoint because it handles both property data and image uploads
   * 
   * Property creation process: validate user permissions (landlord or admin only),
   * extract and validate property data from request, create property record in database,
   * handle multiple image uploads if provided, return created property with ID for frontend.
   * 
   * Common validation issues: users forget required fields (especially address/coordinates),
   * price validation needs to handle strings vs numbers, boolean fields come as strings from forms.
   */
  createProperty: async (req, res) => {
    try {
      // console.log('Creating property for user:', req.user.id); // track property creation
      // console.log('Property data received:', req.body); // useful for debugging form issues
      
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
        address: req.body.address, // Auto-generated address
        image: req.body.image // This will be the Cloudinary URL
      };
      
      // Validate required fields
      if (!propertyData.title || !propertyData.price || !propertyData.bedrooms || 
          !propertyData.bathrooms || !propertyData.lat || !propertyData.lng || !propertyData.address) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['title', 'price', 'bedrooms', 'bathrooms', 'lat', 'lng', 'address']
        });
      }
      
      // Create property in database
      const createdProperty = await Property.create(propertyData);
      
      // Handle multiple images if provided (new multi-image system)
      if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
        const images = req.body.images.map((url, index) => ({
          url,
          isPrimary: index === 0 // First image is primary
        }));
        
        // NOTE: don't change this without updating the frontend API calls
        await Property.addImages(createdProperty.id, images);
      }
      
      // Old single-image handling (replaced with PropertyImage table):
      // if (req.body.image) {
      //   // Just store single image URL in property_img_url field
      //   await Property.update(createdProperty.id, { 
      //     ...propertyData, 
      //     image: req.body.image 
      //   });
      // }
      
      res.status(201).json({
        message: 'Property created successfully',
        property: createdProperty
      });
    } catch (error) {
      // TODO: better error handling for validation vs database errors
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
        address: req.body.address || existingProperty.address,
        image: req.body.image || existingProperty.image
      };
      
      // Update the property
      const updatedProperty = await Property.update(id, updateData);
      
      // Handle image updates if provided
      if (req.body.images && Array.isArray(req.body.images)) {
        // Delete existing images
        await Property.deleteImages(id);
        
        // Add new images
        if (req.body.images.length > 0) {
          const images = req.body.images.map((url, index) => ({
            url,
            isPrimary: index === 0
          }));
          
          await Property.addImages(id, images);
        }
      }
      
      res.status(200).json({
        message: 'Property updated successfully',
        property: updatedProperty
      });
    } catch (error) {
      // error during update
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
          // cloudinary cleanup failed - continue anyway
          // Continue with response even if Cloudinary deletion fails
        }
      }
      
      res.status(200).json({
        message: 'Property deleted successfully'
      });
    } catch (error) {
      // error during deletion
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
      // image upload failed
      res.status(500).json({ 
        message: 'Error uploading image', 
        error: error.message 
      });
    }
  },
  
  /**
   * Upload multiple property images to Cloudinary
   * Handles up to 10 images per property with automatic ordering
   */
  uploadMultipleImages: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      // Current multi-image upload handling
      const urls = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      
      res.status(200).json({
        message: 'Images uploaded successfully',
        images: urls
      });
      
      // Old single image upload (before multiple images were supported):
      // if (!req.file) {
      //   return res.status(400).json({ message: 'No image file provided' });
      // }
      // 
      // res.status(200).json({
      //   message: 'Image uploaded successfully',
      //   imageUrl: req.file.path,
      //   publicId: req.file.filename
      // });
    } catch (error) {
      // multiple images upload failed
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
      // error fetching user properties
      res.status(500).json({ 
        message: 'Error fetching your properties', 
        error: error.message 
      });
    }
  },

  /**
   * Get property images
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getPropertyImages: async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
      
      const images = await Property.getImages(propertyId);
      
      res.status(200).json({
        images
      });
    } catch (error) {
      // error fetching property images
      res.status(500).json({ 
        message: 'Error fetching property images', 
        error: error.message 
      });
    }
  }
};

module.exports = propertyController;