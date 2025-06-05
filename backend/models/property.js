const db = require('../config/db');

// Property data model
const Property = {
  // get all properties with filters
  getAll: async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    try {
      // main query
      let query = `
        SELECT 
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
          p.property_address AS address, 
          COALESCE(
            (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1),
            (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id ORDER BY order_index ASC LIMIT 1),
            p.property_img_url
          ) AS image
        FROM Property p
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // add filters
      if (filters.keyword) {
        query += ' AND (p.property_name LIKE ? OR p.property_address LIKE ?)';
        queryParams.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
      }
      
      if (filters.minPrice) {
        query += ' AND p.property_price >= ?';
        queryParams.push(Number(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        query += ' AND p.property_price <= ?';
        queryParams.push(Number(filters.maxPrice));
      }
      
      if (filters.bedrooms) {
        query += ' AND p.property_room >= ?';
        queryParams.push(Number(filters.bedrooms));
      }
      
      if (filters.bathrooms) {
        query += ' AND p.property_bathroom >= ?';
        queryParams.push(Number(filters.bathrooms));
      }
      
      if (filters.type && Array.isArray(filters.type) && filters.type.length > 0 && !filters.type.includes('all')) {
        const typeValues = filters.type.map(t => {
          // convert type
          return isNaN(t) ? 
            (t === 'house' ? 0 : t === 'apartment' ? 1 : t === 'townhouse' ? 2 : t === 'villa' ? 3 : null) : 
            Number(t);
        }).filter(t => t !== null);
        
        if (typeValues.length > 0) {
          query += ' AND p.property_type IN (?)';
          queryParams.push(typeValues);
        }
      }
      
      if (filters.status !== undefined) {
        query += ' AND p.property_status = ?';
        queryParams.push(Number(filters.status));
      }
      
      // order by
      query += ' ORDER BY p.property_id DESC';
      
      // pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(Number(pagination.limit), offset);
      
      // execute query
      const [properties] = await db.query(query, queryParams);
      
      // count total
      let countQuery = `
        SELECT COUNT(*) AS total 
        FROM Property
        WHERE 1=1
      `;
      
      // apply filters
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
      
      // remove pagination
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
  
  // get by id
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
          p.property_address AS address, 
          COALESCE(
            (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1),
            (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id ORDER BY order_index ASC LIMIT 1),
            p.property_img_url
          ) AS image,
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
          property_address,
          property_img_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          property.address,
          property.image
        ]
      );
      
      return { id: result.insertId, ...property };
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },
  
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
          property_address = ?,
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
          property.address,
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
  
  delete: async (id) => {
    try {
      // check exists
      const [properties] = await db.query(
        'SELECT property_id FROM Property WHERE property_id = ?',
        [id]
      );
      
      if (properties.length === 0) {
        return { success: false, message: 'Property not found' };
      }
      
      // delete property
      await db.query('DELETE FROM Property WHERE property_id = ?', [id]);
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting property with ID ${id}:`, error);
      throw error;
    }
  },
  
  getByOwnerId: async (ownerId) => {
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
          p.property_address AS address, 
          COALESCE(
            (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1),
            (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id ORDER BY order_index ASC LIMIT 1),
            p.property_img_url
          ) AS image
        FROM Property p
        WHERE p.property_owner_id = ?
        ORDER BY p.property_id DESC`,
        [ownerId]
      );
      
      // add images
      for (let property of properties) {
        const images = await Property.getImages(property.id);
        property.images = images.map(img => img.image_url);
      }
      
      return properties;
    } catch (error) {
      console.error(`Error fetching properties for owner ${ownerId}:`, error);
      throw error;
    }
  },

  // image methods
  addImages: async (propertyId, images) => {
    try {
      const values = images.map((image, index) => [
        propertyId,
        image.url,
        image.isPrimary || false,
        index
      ]);
      
      await db.query(
        `INSERT INTO PropertyImage (property_id, image_url, is_primary, order_index) VALUES ?`,
        [values]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error adding property images:', error);
      throw error;
    }
  },

  getImages: async (propertyId) => {
    try {
      const [images] = await db.query(
        `SELECT image_id, image_url, is_primary, order_index
         FROM PropertyImage 
         WHERE property_id = ? 
         ORDER BY order_index ASC`,
        [propertyId]
      );
      
      return images;
    } catch (error) {
      console.error(`Error fetching images for property ${propertyId}:`, error);
      throw error;
    }
  },

  deleteImages: async (propertyId) => {
    try {
      await db.query('DELETE FROM PropertyImage WHERE property_id = ?', [propertyId]);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting images for property ${propertyId}:`, error);
      throw error;
    }
  }
};

module.exports = Property;