CREATE DATABASE Rent_database;
USE Rent_database;  -- Database 
-- User Table
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100),
    user_email VARCHAR(150),
    user_password VARCHAR(255),
    user_phone VARCHAR(20),
    user_role TINYINT, -- 0 = renter, 1 = landlord, 2 = admin
    user_registered_at DATETIME,
    user_avatar_url TEXT,
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
I-- Renter user
INSERT IGNORE INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at, user_avatar_url) 
VALUES ('Jialao Liu', 'Jarvis@example.com', 'HashPassword', '0400000000', 0, NOW(), 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747484989/defaultavatar_eavhnz.png');

-- Landlord user
INSERT IGNORE INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at, user_avatar_url) 
VALUES ('test', 'test@example.com', '11111111', '0400111000', 1, NOW(), 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747484989/defaultavatar_eavhnz.png');

-- Admin user
INSERT IGNORE INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at, user_avatar_url) 
VALUES ('admin01', 'admin@example.com', '11111111', '0400222000', 2, NOW(), 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747484989/defaultavatar_eavhnz.png');

INSERT INTO Property (property_owner_id, property_name, property_price, property_room, property_bathroom, property_garages, property_aircon, property_balcony, property_petsconsidered, property_furnished, property_type, property_status, property_latitude, property_longitude, property_img_url)
VALUES (1, 'Modern City Apartment', 750, 2, 1, 1, 1, 1, 0, 0, 1, 0, -33.8679, 151.2073, 'https://example.com/property.jpg');

INSERT INTO Favorite (favorite_user_id, favorite_property_id, favorite_saved_at)
VALUES (1, 1, NOW());

INSERT INTO Booking (booking_user_id, booking_property_id, booking_datetime, booking_status, booking_created_at)
VALUES (1, 1, '2025-04-01 17:00:00', 0, NOW());

INSERT INTO Application (application_user_id, application_property_id, application_status, application_message, application_created_at)
VALUES (1, 1, 0, 'Looking forward to renting this place.', NOW());