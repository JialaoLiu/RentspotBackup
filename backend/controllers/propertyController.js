const Property = require('../models/property');
const PropertyImage = require('../models/propertyImage');
const cloudinary = require('../config/cloudinary');

// Property controller
const propertyController = {
  /**
   * Get all properties with filtering and pagination
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllProperties: async (req, res) => {
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
  // Get property by ID
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
      
      // Get property images
      const propertyImages = await PropertyImage.getByPropertyId(id);
      property.images = propertyImages;
      
      // Set primary image
      if (propertyImages.length > 0) {
        const primaryImage = propertyImages.find(img => img.isPrimary);
        if (primaryImage) {
          property.image = primaryImage.url;
        }
      }
      
      res.status(200).json(property);
    } catch (error) {
      console.error('Error getting property:', error);
      res.status(500).json({ message: 'Error fetching property' });
    }
  },
  
  /**
   * Create a new property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  // Create property
  createProperty: async (req, res) => {
    try {
      // Get data from request
      const propertyData = {
        owner_id: req.user.id,
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
        image: req.body.primaryImage || req.body.image || ''
      };
      
      // Check required fields
      if (!propertyData.title || !propertyData.price || !propertyData.bedrooms || 
          !propertyData.bathrooms || !propertyData.lat || !propertyData.lng) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['title', 'price', 'bedrooms', 'bathrooms', 'lat', 'lng']
        });
      }
      
      // Create property
      const createdProperty = await Property.create(propertyData);
      
      // Handle multiple images
      if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
        const propertyImages = await PropertyImage.createMultiple(
          createdProperty.id, 
          req.body.images
        );
        createdProperty.images = propertyImages;
        
        // Set primary image
        if (propertyImages.length > 0) {
          const primaryImage = propertyImages.find(img => img.isPrimary) || propertyImages[0];
          await Property.update(createdProperty.id, {
            ...createdProperty,
            image: primaryImage.url
          });
          createdProperty.image = primaryImage.url;
        }
      }
      // Handle single image
      else if (propertyData.image) {
        const propertyImage = await PropertyImage.create({
          propertyId: createdProperty.id,
          url: propertyData.image,
          isPrimary: true,
          orderIndex: 0
        });
        createdProperty.images = [propertyImage];
      }
      
      res.status(201).json({
        message: 'Property created successfully',
        property: createdProperty
      });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ message: 'Error creating property' });
    }
  },
  
  /**
   * Update an existing property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  // Update property
  updateProperty: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
      
      // Get existing property
      const existingProperty = await Property.getById(id);
      
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check ownership
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
        image: existingProperty.image // Keep existing image for now
      };
      
      // Update property
      const updatedProperty = await Property.update(id, updateData);
      
      // Handle image updates
      if (req.body.images && Array.isArray(req.body.images)) {
        // Replace all images if requested
        if (req.body.replaceAllImages) {
          await PropertyImage.deleteByPropertyId(id);
        }
        
        // Add new images
        if (req.body.images.length > 0) {
          const propertyImages = await PropertyImage.createMultiple(id, req.body.images);
          updatedProperty.images = propertyImages;
          
          // Set primary image
          const primaryImage = propertyImages.find(img => img.isPrimary) || propertyImages[0];
          if (primaryImage) {
            await Property.update(id, { image: primaryImage.url });
            updatedProperty.image = primaryImage.url;
          }
        }
      } 
      // Handle primary image update
      else if (req.body.primaryImage) {
        const propertyImage = await PropertyImage.create({
          propertyId: id,
          url: req.body.primaryImage,
          isPrimary: true,
          orderIndex: 0
        });
        
        await Property.update(id, { image: req.body.primaryImage });
        updatedProperty.image = req.body.primaryImage;
      }
      
      // Get all images for response
      const propertyImages = await PropertyImage.getByPropertyId(id);
      updatedProperty.images = propertyImages;
      
      res.status(200).json({
        message: 'Property updated successfully',
        property: updatedProperty
      });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ message: 'Error updating property' });
    }
  },
  
  /**
   * Delete a property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  // Delete property
  deleteProperty: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
      
      // Get property
      const existingProperty = await Property.getById(id);
      
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check ownership
      if (existingProperty.owner_id !== req.user.id && req.user.role !== 2) {
        return res.status(403).json({ message: 'Unauthorized: You can only delete your own properties' });
      }
      
      // Get all property images
      const propertyImages = await PropertyImage.getByPropertyId(id);
      
      // Delete Cloudinary images
      const deletionPromises = propertyImages.map(async (image) => {
        if (image.url && image.url.includes('cloudinary')) {
          try {
            const urlParts = image.url.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            
            await cloudinary.uploader.destroy(`rentspot-properties/${publicId}`);
          } catch (cloudinaryErr) {
            console.error('Error deleting image from Cloudinary:', cloudinaryErr);
          }
        }
      });
      
      await Promise.all(deletionPromises);
      
      // Delete property images
      await PropertyImage.deleteByPropertyId(id);
      
      // Delete property
      const result = await Property.delete(id);
      
      res.status(200).json({
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ message: 'Error deleting property' });
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
  // Upload multiple images
  uploadMultipleImages: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      // Get uploaded file info
      const urls = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      
      // If property ID provided, save to property
      if (req.body.propertyId) {
        const propertyId = parseInt(req.body.propertyId);
        
        if (!isNaN(propertyId)) {
          // Verify property exists
          const property = await Property.getById(propertyId);
          
          if (!property) {
            return res.status(404).json({ message: 'Property not found' });
          }
          
          // Check ownership
          if (property.owner_id !== req.user.id && req.user.role !== 2) {
            return res.status(403).json({ 
              message: 'Unauthorized: You can only add images to your own properties' 
            });
          }
          
          // Save images to property
          const imageUrls = urls.map(url => url.url);
          const savedImages = await PropertyImage.createMultiple(propertyId, imageUrls);
          
          // Set primary image if needed
          if (property.image === '' || !property.image) {
            const primaryImage = savedImages[0];
            await Property.update(propertyId, { image: primaryImage.url });
          }
          
          return res.status(200).json({
            message: 'Images uploaded and saved to property',
            images: savedImages
          });
        }
      }
      
      res.status(200).json({
        message: 'Images uploaded successfully',
        images: urls
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: 'Error uploading images' });
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