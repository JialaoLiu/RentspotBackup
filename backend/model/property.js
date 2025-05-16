const db = require('../config/db');

// Property data model
const Property = {
  /**
   * Get all properties with optional filtering and pagination
   * @param {Object} filters - Filter parameters
   * @param {Object} pagination - Pagination options
   * @returns {Promise} - Properties list
   */
  getAll: async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    try {
      // Base query
      let query = `
        SELECT 
          property_id AS id, 
          property_owner_id AS owner_id, 
          property_name AS title, 
          property_price AS price, 
          property_room AS bedrooms, 
          property_bathroom AS bathrooms, 
          property_garages AS garages, 
          property_aircon AS aircon, 
          property_balcony AS balcony, 
          property_petsconsidered AS petsConsidered, 
          property_furnished AS furnished, 
          property_type AS type, 
          property_status AS status, 
          property_latitude AS lat, 
          property_longitude AS lng, 
          property_img_url AS image
        FROM Property
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Apply filters
      if (filters.keyword) {
        query += ' AND (property_name LIKE ? OR property_address LIKE ?)';
        queryParams.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
      }
      
      if (filters.minPrice) {
        query += ' AND property_price >= ?';
        queryParams.push(Number(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        query += ' AND property_price <= ?';
        queryParams.push(Number(filters.maxPrice));
      }
      
      if (filters.bedrooms) {
        query += ' AND property_room >= ?';
        queryParams.push(Number(filters.bedrooms));
      }
      
      if (filters.bathrooms) {
        query += ' AND property_bathroom >= ?';
        queryParams.push(Number(filters.bathrooms));
      }
      
      if (filters.type && Array.isArray(filters.type) && filters.type.length > 0 && !filters.type.includes('all')) {
        const typeValues = filters.type.map(t => {
          // Convert string type to number if needed
          return isNaN(t) ? 
            (t === 'house' ? 0 : t === 'apartment' ? 1 : t === 'townhouse' ? 2 : t === 'villa' ? 3 : null) : 
            Number(t);
        }).filter(t => t !== null);
        
        if (typeValues.length > 0) {
          query += ' AND property_type IN (?)';
          queryParams.push(typeValues);
        }
      }
      
      if (filters.status !== undefined) {
        query += ' AND property_status = ?';
        queryParams.push(Number(filters.status));
      }
      
      // Add order by
      query += ' ORDER BY property_id DESC';
      
      // Add pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(Number(pagination.limit), offset);
      
      // Execute query
      const [properties] = await db.query(query, queryParams);
      
      // Count total for pagination
      let countQuery = `
        SELECT COUNT(*) AS total 
        FROM Property
        WHERE 1=1
      `;
      
      // Apply the same filters to count query
      if (filters.keyword) {
        countQuery += ' AND (property_name LIKE ? OR property_address LIKE ?)';
      }
      
      if (filters.minPrice) {
        countQuery += ' AND property_price >= ?';
      }
      
      if (filters.maxPrice) {
        countQuery += ' AND property_price <= ?';
      }
      
      if (filters.bedrooms) {
        countQuery += ' AND property_room >= ?';
      }
      
      if (filters.bathrooms) {
        countQuery += ' AND property_bathroom >= ?';
      }
      
      if (filters.type && Array.isArray(filters.type) && filters.type.length > 0 && !filters.type.includes('all')) {
        countQuery += ' AND property_type IN (?)';
      }
      
      if (filters.status !== undefined) {
        countQuery += ' AND property_status = ?';
      }
      
      // Remove limit and offset params for count query
      const countParams = queryParams.slice(0, -2);
      
      const [countResult] = await db.query(countQuery, countParams);
      const total = countResult[0].total;
      
      return {
        properties,
        pagination: {
          total,
          page: pagination.page,
          limit: pagination.limit,
          pages: Math.ceil(total / pagination.limit)
        }
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },
  
  /**
   * Get a single property by ID
   * @param {number} id - Property ID
   * @returns {Promise} - Property details
   */
  getById: async (id) => {
    try {
      const [properties] = await db.query(
        `SELECT 
          p.property_id AS id, 
          p.property_owner_id AS owner_id, 
          p.property_name AS title, 
          p.property_price AS price, 
          p.property_room AS bedrooms, 
          p.property_bathroom AS bathrooms, 
          p.property_garages AS garages, 
          p.property_aircon AS aircon, 
          p.property_balcony AS balcony, 
          p.property_petsconsidered AS petsConsidered, 
          p.property_furnished AS furnished, 
          p.property_type AS type, 
          p.property_status AS status, 
          p.property_latitude AS lat, 
          p.property_longitude AS lng, 
          p.property_img_url AS image,
          u.user_name AS owner_name,
          u.user_email AS owner_email,
          u.user_phone AS owner_phone
        FROM Property p
        JOIN User u ON p.property_owner_id = u.user_id
        WHERE p.property_id = ?`,
        [id]
      );
      
      if (properties.length === 0) {
        return null;
      }
      
      return properties[0];
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new property
   * @param {Object} property - Property data
   * @returns {Promise} - Created property
   */
  create: async (property) => {
    try {
      const [result] = await db.query(
        `INSERT INTO Property (
          property_owner_id, 
          property_name, 
          property_price, 
          property_room, 
          property_bathroom, 
          property_garages, 
          property_aircon, 
          property_balcony, 
          property_petsconsidered, 
          property_furnished, 
          property_type, 
          property_status,
          property_latitude,
          property_longitude,
          property_img_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.owner_id,
          property.title,
          property.price,
          property.bedrooms,
          property.bathrooms,
          property.garages || 0,
          property.aircon || 0,
          property.balcony || 0,
          property.petsConsidered || 0,
          property.furnished || 0,
          property.type,
          property.status || 0,
          property.lat,
          property.lng,
          property.image
        ]
      );
      
      return { id: result.insertId, ...property };
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing property
   * @param {number} id - Property ID
   * @param {Object} property - Updated property data
   * @returns {Promise} - Updated property
   */
  update: async (id, property) => {
    try {
      await db.query(
        `UPDATE Property SET
          property_name = ?,
          property_price = ?,
          property_room = ?,
          property_bathroom = ?,
          property_garages = ?,
          property_aircon = ?,
          property_balcony = ?,
          property_petsconsidered = ?,
          property_furnished = ?,
          property_type = ?,
          property_status = ?,
          property_latitude = ?,
          property_longitude = ?,
          property_img_url = ?
        WHERE property_id = ?`,
        [
          property.title,
          property.price,
          property.bedrooms,
          property.bathrooms,
          property.garages || 0,
          property.aircon || 0,
          property.balcony || 0,
          property.petsConsidered || 0,
          property.furnished || 0,
          property.type,
          property.status || 0,
          property.lat,
          property.lng,
          property.image,
          id
        ]
      );
      
      return { id, ...property };
    } catch (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a property
   * @param {number} id - Property ID
   * @returns {Promise} - Result of deletion
   */
  delete: async (id) => {
    try {
      // First check if property exists
      const [properties] = await db.query(
        'SELECT property_id FROM Property WHERE property_id = ?',
        [id]
      );
      
      if (properties.length === 0) {
        return { success: false, message: 'Property not found' };
      }
      
      // Delete the property
      await db.query('DELETE FROM Property WHERE property_id = ?', [id]);
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting property with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get properties by owner ID
   * @param {number} ownerId - Owner user ID
   * @returns {Promise} - Owner's properties
   */
  getByOwnerId: async (ownerId) => {
    try {
      const [properties] = await db.query(
        `SELECT 
          property_id AS id, 
          property_owner_id AS owner_id, 
          property_name AS title, 
          property_price AS price, 
          property_room AS bedrooms, 
          property_bathroom AS bathrooms, 
          property_garages AS garages, 
          property_aircon AS aircon, 
          property_balcony AS balcony, 
          property_petsconsidered AS petsConsidered, 
          property_furnished AS furnished, 
          property_type AS type, 
          property_status AS status, 
          property_latitude AS lat, 
          property_longitude AS lng, 
          property_img_url AS image
        FROM Property
        WHERE property_owner_id = ?
        ORDER BY property_id DESC`,
        [ownerId]
      );
      
      return properties;
    } catch (error) {
      console.error(`Error fetching properties for owner ${ownerId}:`, error);
      throw error;
    }
  }
};

module.exports = Property;