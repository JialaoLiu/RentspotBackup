#!/bin/bash
set -e

echo "Starting RentSpot auto-setup..."

# Function to handle errors
handle_error() {
    echo "Error occurred in setup. Continuing with manual instructions..."
    echo "Manual setup commands:"
    echo "1. cd backend && npm install"
    echo "2. cd ../rentspot-frontend && npm install"
    echo "3. mysql -u root -e 'CREATE DATABASE IF NOT EXISTS Rent_database;'"
    echo "4. mysql -u root Rent_database < backend/Rent_database_updated.sql"
    exit 0  # Don't fail the container creation
}

trap handle_error ERR

# Ensure we're in the right directory
cd /workspaces/*/

# Install MySQL if needed (should already be installed in WDC image)
if ! command -v mysql &> /dev/null; then
    echo "Installing MySQL..."
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server mysql-client
fi

# Start MySQL
echo "Starting MySQL..."
service mysql start || service mariadb start || true
sleep 5

# Create database
echo "Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS Rent_database;" || echo "Database creation failed, will continue..."

# Import database if file exists
if [ -f "backend/Rent_database_updated.sql" ]; then
    echo "Importing database schema..."
    mysql -u root Rent_database < backend/Rent_database_updated.sql || echo "Database import failed, will continue..."
fi

# Backend setup
echo "Setting up backend..."
cd backend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env..."
    cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=Rent_database
DB_PORT=3306
JWT_SECRET=00ae84691b5cc7bb6ca21e11779bc0cefb5ed62d1b7331a71ea0628e7f2c98d54331b54f3c67084bc2ec0e78e9ef21473b9b575eb7e8336dc5faebdafb44dacf
PORT=8080
CLOUDINARY_CLOUD_NAME=dzxrmtus9
CLOUDINARY_API_KEY=138993529279886
CLOUDINARY_API_SECRET=23CK6Atf0I_PolCywakizy-PJU8
TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
TURNSTILE_SECRET_KEY=0x4AAAAAABdkii48VRRJP3Cb8Ggbml6zNyQ
NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3
EOF
fi

# Install backend dependencies
echo "Installing backend dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Frontend setup
echo "Setting up frontend..."
cd ../rentspot-frontend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env..."
    cat > .env << 'EOF'
VUE_APP_API_BASE_URL=http://localhost:8080/api
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned
VUE_APP_TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
VUE_APP_TURNSTILE_TEST_SITE_KEY=1x00000000000000000000AA
EOF
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

echo ""
echo "RentSpot setup complete!"
echo ""
echo "To start the application:"
echo "Terminal 1: cd backend && npm start"
echo "Terminal 2: cd rentspot-frontend && npm run serve"
echo ""