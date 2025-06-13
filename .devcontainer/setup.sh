#!/bin/bash

echo "Setting up RentSpot development environment..."

# Update package lists
sudo apt-get update

# Install MySQL if not already installed
if ! command -v mysql &> /dev/null; then
    echo "Installing MySQL..."
    sudo apt-get install -y mysql-server mysql-client
fi

# Start MySQL service
echo "Starting MySQL service..."
sudo service mysql start

# Configure MySQL for development (no password)
echo "Configuring MySQL..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Create database if it doesn't exist
echo "Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS Rent_database;"

# Import database schema if SQL file exists
if [ -f "backend/Rent_database_updated.sql" ]; then
    echo "Importing database schema..."
    mysql -u root Rent_database < backend/Rent_database_updated.sql
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Copy .env.example to .env if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << EOL
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=Rent_database
DB_PORT=3306

# JWT Configuration
JWT_SECRET=00ae84691b5cc7bb6ca21e11779bc0cefb5ed62d1b7331a71ea0628e7f2c98d54331b54f3c67084bc2ec0e78e9ef21473b9b575eb7e8336dc5faebdafb44dacf

# Server Configuration
PORT=8080

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dzxrmtus9
CLOUDINARY_API_KEY=138993529279886
CLOUDINARY_API_SECRET=23CK6Atf0I_PolCywakizy-PJU8

# Cloudflare Turnstile Configuration
TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
TURNSTILE_SECRET_KEY=0x4AAAAAABdkii48VRRJP3Cb8Ggbml6zNyQ

# NewsAPI Configuration
NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3
EOL
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../rentspot-frontend
npm install

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOL
# API Base URL
VUE_APP_API_BASE_URL=http://localhost:8080/api

# Cloudinary configuration
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned

# Cloudflare Turnstile configuration
VUE_APP_TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
VUE_APP_TURNSTILE_TEST_SITE_KEY=1x00000000000000000000AA
EOL
fi

# Return to root directory
cd ..

echo "Development environment setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd rentspot-frontend && npm run serve"
echo ""
echo "Default ports:"
echo "- Backend API: http://localhost:8080"
echo "- Frontend: http://localhost:5173"
echo "- MySQL: localhost:3306"