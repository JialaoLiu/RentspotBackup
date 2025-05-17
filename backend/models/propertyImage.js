const db = require('../config/db');

const PropertyImage = {
  // Get all images for a property
  getByPropertyId: async (propertyId) => {
    try {
      const [images] = await db.query(
        `SELECT 
          image_id AS id,
          property_id AS propertyId,
          image_url AS url,
          is_primary AS isPrimary,
          order_index AS orderIndex,
          created_at AS createdAt
        FROM PropertyImage
        WHERE property_id = ?
        ORDER BY order_index ASC, created_at ASC`,
        [propertyId]
      );
      
      return images;
    } catch (error) {
      console.error(`Error fetching images for property ${propertyId}:`, error);
      throw error;
    }
  },
  
  // Add a new image
  create: async (imageData) => {
    try {
      // Make primary if it's the first image
      let isPrimary = imageData.isPrimary || false;
      
      if (!isPrimary) {
        const [existingImages] = await db.query(
          'SELECT COUNT(*) as count FROM PropertyImage WHERE property_id = ?',
          [imageData.propertyId]
        );
        
        if (existingImages[0].count === 0) {
          isPrimary = true;
        }
      }
      
      // If primary, unset other primary images
      if (isPrimary) {
        await db.query(
          'UPDATE PropertyImage SET is_primary = FALSE WHERE property_id = ?',
          [imageData.propertyId]
        );
      }
      
      const [result] = await db.query(
        `INSERT INTO PropertyImage (
          property_id, image_url, is_primary, order_index
        ) VALUES (?, ?, ?, ?)`,
        [
          imageData.propertyId,
          imageData.url,
          isPrimary,
          imageData.orderIndex || 0
        ]
      );
      
      return { 
        id: result.insertId,
        propertyId: imageData.propertyId,
        url: imageData.url,
        isPrimary,
        orderIndex: imageData.orderIndex || 0
      };
    } catch (error) {
      console.error('Error creating property image:', error);
      throw error;
    }
  },
  
  // Add multiple images
  createMultiple: async (propertyId, imageUrls) => {
    try {
      // Check if there are existing images
      const [existingImages] = await db.query(
        'SELECT COUNT(*) as count FROM PropertyImage WHERE property_id = ?',
        [propertyId]
      );
      
      const noExistingImages = existingImages[0].count === 0;
      
      // Prepare values for insert
      const values = imageUrls.map((url, index) => {
        const isPrimary = (index === 0 && noExistingImages) ? 1 : 0;
        return [propertyId, url, isPrimary, index];
      });
      
      // If adding first image, unset any existing primary
      if (noExistingImages && imageUrls.length > 0) {
        await db.query(
          'UPDATE PropertyImage SET is_primary = FALSE WHERE property_id = ?',
          [propertyId]
        );
      }
      
      // Insert all images
      const [result] = await db.query(
        `INSERT INTO PropertyImage (
          property_id, image_url, is_primary, order_index
        ) VALUES ?`,
        [values]
      );
      
      // Return created images
      return imageUrls.map((url, index) => ({
        id: result.insertId + index,
        propertyId,
        url,
        isPrimary: (index === 0 && noExistingImages),
        orderIndex: index
      }));
    } catch (error) {
      console.error(`Error adding multiple images for property ${propertyId}:`, error);
      throw error;
    }
  },
  
  // Update an image
  update: async (id, imageData) => {
    try {
      // If setting as primary, unset others
      if (imageData.isPrimary) {
        const [image] = await db.query(
          'SELECT property_id FROM PropertyImage WHERE image_id = ?',
          [id]
        );
        
        if (image.length > 0) {
          await db.query(
            'UPDATE PropertyImage SET is_primary = FALSE WHERE property_id = ?',
            [image[0].property_id]
          );
        }
      }
      
      await db.query(
        `UPDATE PropertyImage SET
          image_url = COALESCE(?, image_url),
          is_primary = COALESCE(?, is_primary),
          order_index = COALESCE(?, order_index)
        WHERE image_id = ?`,
        [
          imageData.url,
          imageData.isPrimary,
          imageData.orderIndex,
          id
        ]
      );
      
      // Get the updated image
      const [images] = await db.query(
        `SELECT 
          image_id AS id,
          property_id AS propertyId,
          image_url AS url,
          is_primary AS isPrimary,
          order_index AS orderIndex,
          created_at AS createdAt
        FROM PropertyImage
        WHERE image_id = ?`,
        [id]
      );
      
      return images[0];
    } catch (error) {
      console.error(`Error updating image ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an image
  delete: async (id) => {
    try {
      // Check if image exists and if it's primary
      const [images] = await db.query(
        'SELECT image_id, property_id, is_primary FROM PropertyImage WHERE image_id = ?',
        [id]
      );
      
      if (images.length === 0) {
        return { success: false, message: 'Image not found' };
      }
      
      const image = images[0];
      
      // Delete the image
      await db.query('DELETE FROM PropertyImage WHERE image_id = ?', [id]);
      
      // If it was primary, set a new primary
      if (image.is_primary) {
        const [remainingImages] = await db.query(
          'SELECT image_id FROM PropertyImage WHERE property_id = ? ORDER BY order_index ASC, created_at ASC LIMIT 1',
          [image.property_id]
        );
        
        if (remainingImages.length > 0) {
          await db.query(
            'UPDATE PropertyImage SET is_primary = TRUE WHERE image_id = ?',
            [remainingImages[0].image_id]
          );
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting image ${id}:`, error);
      throw error;
    }
  },
  
  // Delete all images for a property
  deleteByPropertyId: async (propertyId) => {
    try {
      await db.query('DELETE FROM PropertyImage WHERE property_id = ?', [propertyId]);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting images for property ${propertyId}:`, error);
      throw error;
    }
  }
};

module.exports = PropertyImage;