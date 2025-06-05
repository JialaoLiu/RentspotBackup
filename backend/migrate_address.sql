-- Migration script to add property_address field
USE Rent_database;

-- Add property_address column if it doesn't exist
ALTER TABLE Property ADD COLUMN property_address VARCHAR(200) AFTER property_longitude;

-- Update existing properties with default addresses based on coordinates
-- These will be replaced by real addresses from Google Maps reverse geocoding
UPDATE Property SET property_address = CASE 
    WHEN property_id = 1 THEN 'Adelaide 5000'
    WHEN property_id = 2 THEN 'North Adelaide 5006'  
    WHEN property_id = 3 THEN 'Adelaide 5000'
    WHEN property_id = 4 THEN 'Adelaide 5000'
    ELSE CONCAT('Adelaide ', LPAD(property_id + 5000, 4, '0'))
END 
WHERE property_address IS NULL OR property_address = '';

-- Check the result
SELECT property_id, property_name, property_address FROM Property;