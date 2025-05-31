DROP DATABASE IF EXISTS Rent_database;
CREATE DATABASE Rent_database;
USE Rent_database;  -- Database 

DROP TABLE IF EXISTS Application;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Favorite;
DROP TABLE IF EXISTS PropertyImage;
DROP TABLE IF EXISTS Property;
DROP TABLE IF EXISTS User;



-- User Table
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100),
    user_email VARCHAR(150),
    user_password VARCHAR(255),
    user_phone VARCHAR(20),
    user_role TINYINT, -- 0 = renter, 1 = landlord, 2 = admin
    user_registered_at DATETIME,
    user_avatar_url TEXT, -- Cannot have DEFAULT on TEXT type in MySQL
    user_date_of_birth DATE
);

-- Property Table
CREATE TABLE Property (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    property_owner_id INT,
    property_name VARCHAR(100),
    property_price INT,
    property_room TINYINT,
    property_bathroom TINYINT,
    property_garages TINYINT,
    property_aircon TINYINT, -- 1 = Yes, 0 = No
    property_balcony TINYINT,
    property_petsconsidered TINYINT,
    property_furnished TINYINT, -- 0 = Furnished, 1 = Unfurnished, 2 = Partially
    property_type TINYINT, -- 0 = House, 1 = Apartment, 2 = Townhouse, 3 = Villa
    property_status TINYINT, -- 0 = Available, 1 = Booked, 2 = Removed
    property_latitude DECIMAL(10,7),
    property_longitude DECIMAL(10,7),
    property_img_url TEXT,
    FOREIGN KEY (property_owner_id) REFERENCES User(user_id)
);

-- PropertyImage Table
CREATE TABLE PropertyImage (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE
);

-- Add an index to improve query performance
CREATE INDEX idx_property_images_property_id ON PropertyImage(property_id);

-- Favorite Table
CREATE TABLE Favorite (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    favorite_user_id INT,
    favorite_property_id INT,
    favorite_saved_at DATETIME,
    FOREIGN KEY (favorite_user_id) REFERENCES User(user_id),
    FOREIGN KEY (favorite_property_id) REFERENCES Property(property_id)
);

-- Booking Table
CREATE TABLE Booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_user_id INT,
    booking_property_id INT,
    booking_datetime DATETIME,
    booking_status TINYINT, -- 0 = Pending, 1 = Confirmed, 2 = Cancelled
    booking_created_at DATETIME,
    FOREIGN KEY (booking_user_id) REFERENCES User(user_id),
    FOREIGN KEY (booking_property_id) REFERENCES Property(property_id)
);

-- Application Table
CREATE TABLE Application (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    application_user_id INT,
    application_property_id INT,
    application_status TINYINT, -- 0 = Submitted, 1 = Approved, 2 = Rejected
    application_message TEXT,
    application_created_at DATETIME,
    FOREIGN KEY (application_user_id) REFERENCES User(user_id),
    FOREIGN KEY (application_property_id) REFERENCES Property(property_id)
);

-- Sample insert for testing (1 user + 1 property + 1 favorite + 1 booking + 1 application)
-- password:11111111
-- 新版本bcrypt 5.1.1生成的哈希
-- $2b$10$m03ZPG3oZ2vc0UTtQ/E3z.FnMCV5Gnx4yLuUe2AmqIbWb4sim7Cka

-- 默认头像URL - 用于未设置头像的用户
-- https://res.cloudinary.com/dzxrmtus9/image/upload/v1747541055/defaultavatar_eavhnz_ezkjxa.png

-- 1. Jialao Liu (renter)
INSERT INTO User (
    user_name, user_email, user_password, user_phone,
    user_role, user_registered_at, user_avatar_url, user_date_of_birth
)
VALUES (
    'Jialao Liu', 'Jarvis@example.com',
    '$2b$10$m03ZPG3oZ2vc0UTtQ/E3z.FnMCV5Gnx4yLuUe2AmqIbWb4sim7Cka',
    '0400000000', 0, NOW(),
    'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747511615/rentspot-avatars/u3wzfd5o5ckih6adjafx.jpg',
    '1999-08-26'
);

-- 2. test (landlord)
INSERT INTO User (
    user_name, user_email, user_password, user_phone,
    user_role, user_registered_at, user_avatar_url, user_date_of_birth
)
VALUES (
    'test', 'test@example.com',
    '$2b$10$m03ZPG3oZ2vc0UTtQ/E3z.FnMCV5Gnx4yLuUe2AmqIbWb4sim7Cka',
    '0400111000', 1, NOW(),
    'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747484989/defaultavatar_eavhnz.png',
    '2003-12-23'
);

-- 3. admin01
INSERT INTO User (
    user_name, user_email, user_password, user_phone,
    user_role, user_registered_at, user_avatar_url, user_date_of_birth
)
VALUES (
    'admin01', 'admin@example.com',
    '$2b$10$m03ZPG3oZ2vc0UTtQ/E3z.FnMCV5Gnx4yLuUe2AmqIbWb4sim7Cka',
    '0400222000', 2, NOW(),
    'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747484989/defaultavatar_eavhnz.png',
    '2003-12-23'
);

-- 4. Jialao (renter)
INSERT INTO User (
    user_name, user_email, user_password, user_phone,
    user_role, user_registered_at, user_avatar_url, user_date_of_birth
)
VALUES (
    'Jialao', 'Jarvis001@example.com',
    '$2b$10$m03ZPG3oZ2vc0UTtQ/E3z.FnMCV5Gnx4yLuUe2AmqIbWb4sim7Cka',
    '0123456789', 0, NOW(),
    'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747511615/rentspot-avatars/u3wzfd5o5ckih6adjafx.jpg',
    '1999-08-26'
);

-- 5. Jarvis (renter)
INSERT INTO User (
    user_name, user_email, user_password, user_phone,
    user_role, user_registered_at, user_avatar_url, user_date_of_birth
)
VALUES (
    'Jarvis', 'Jarvis002@example.com',
    '$2b$10$m03ZPG3oZ2vc0UTtQ/E3z.FnMCV5Gnx4yLuUe2AmqIbWb4sim7Cka',
    '0123456789', 0, NOW(),
    'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747511615/rentspot-avatars/u3wzfd5o5ckih6adjafx.jpg',
    '1999-08-26'
);






-- Sample properties
INSERT INTO Property (
    property_owner_id, property_name, property_price, property_room,
    property_bathroom, property_garages, property_aircon, property_balcony,
    property_petsconsidered, property_furnished, property_type, property_status,
    property_latitude, property_longitude, property_img_url
)
VALUES 
-- Scape Waymouth
(2, 'Scape Waymouth', 750, 2, 1, 1, 1, 1, 0, 0, 1, 0,
 -34.9265354, 138.5883644, 
 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553583/Scape.jpg'),

-- Unit 1/119 Melbourne St
(2, 'Unit 1/119 Melbourne St', 890, 4, 2, 2, 1, 1, 1, 0, 0, 0,
 -34.907626, 138.6070387,
 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553574/119_Melbourne_St.png'),

-- Yugo Studio Adelaide City
(2, 'Yugo Studio Adelaide City', 420, 1, 1, 0, 0, 0, 0, 1, 1, 0,
 -34.921389, 138.607972, 
 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553761/yugo_l3ni62.jpg'),

-- Rundle Mall
(2, 'Rundle Mall', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 -34.92280189654248, 138.60278773484836,
 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553722/rundlemall_uruuad.jpg');
 
-- Sample property images
INSERT INTO PropertyImage (property_id, image_url, is_primary, order_index) VALUES
-- Scape images
(1, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553583/Scape.jpg', TRUE, 0),
(1, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553583/Scape.jpg', FALSE, 1),
(1, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553583/Scape.jpg', FALSE, 2),
(1, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553583/Scape.jpg', FALSE, 3),
-- Melbourne St images
(2, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553574/119_Melbourne_St.png', TRUE, 0),
(2, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553574/119_Melbourne_St.png', FALSE, 1),
(2, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553574/119_Melbourne_St.png', FALSE, 2),
-- Yugo images
(3, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553761/yugo_l3ni62.jpg', TRUE, 0),
(3, 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747553761/yugo_l3ni62.jpg', FALSE, 1);


-- Sample favorites
INSERT INTO Favorite (favorite_user_id, favorite_property_id, favorite_saved_at)
VALUES 
(1, 1, NOW()),
(1, 2, NOW());

-- Sample bookings
INSERT INTO Booking (booking_user_id, booking_property_id, booking_datetime, booking_status, booking_created_at)
VALUES 
(1, 1, '2025-04-01 17:00:00', 0, NOW()),
(1, 3, '2025-04-03 10:30:00', 0, NOW());

-- Sample applications
INSERT INTO Application (application_user_id, application_property_id, application_status, application_message, application_created_at)
VALUES 
(1, 1, 0, 'Looking forward to renting this modern apartment.', NOW()),
(1, 2, 0, 'This family home would be perfect for us.', NOW());