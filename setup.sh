#!/bin/bash

# RentSpot Complete Setup Script
# This script handles all setup: MySQL, database, API configuration, dependencies

set -e

echo "Starting RentSpot Complete Setup..."
echo "Environment: ${CODESPACE_NAME:-Local}"

# 1. Start MySQL Service
echo "Starting MySQL service..."
if command -v mysql &> /dev/null; then
    service mysql start 2>/dev/null || sudo service mysql start 2>/dev/null || echo "MySQL might already be running"

    # Wait for MySQL to be ready
    echo "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if mysqladmin ping -h localhost --silent 2>/dev/null; then
            echo "MySQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "MySQL took too long to start"
        fi
        sleep 1
    done
else
    echo "MySQL not installed"
    exit 1
fi

# 2. Create and setup database
echo "Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS Rent_database;" 2>/dev/null || echo "Database might already exist"

# 3. Import database schema with sample data
echo "Importing database schema and data..."
mysql -u root Rent_database < backend/Rent_database_updated.sql

# 4. Setup backend
echo "Configuring backend..."
cd backend

cat > .env << EOF
# Database Configuration (IPv4 for Codespaces)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=Rent_database
DB_PORT=3306

# JWT Secret
JWT_SECRET=00ae84691b5cc7bb6ca21e11779bc0cefb5ed62d1b7331a71ea0628e7f2c98d54331b54f3c67084bc2ec0e78e9ef21473b9b575eb7e8336dc5faebdafb44dacf

# Server Port
PORT=8080

# Frontend URL (will be set based on Codespace)
FRONTEND_URL=https://${CODESPACE_NAME}-5173.app.github.dev

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=dzxrmtus9
CLOUDINARY_API_KEY=138993529279886
CLOUDINARY_API_SECRET=23CK6Atf0I_PolCywakizy-PJU8

# Cloudflare Turnstile credentials
TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
TURNSTILE_SECRET_KEY=0x4AAAAAABdkii48VRRJP3Cb8Ggbml6zNyQ

# NewsAPI Configuration
NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3

# Environment
NODE_ENV=development
EOF

echo "Installing backend dependencies..."
npm install

cd ..

# 5. Setup frontend
echo "Configuring frontend..."
cd rentspot-frontend

cat > .env << EOF
# API Base URL (Codespaces)
VUE_APP_API_BASE_URL=https://${CODESPACE_NAME}-8080.app.github.dev/api

# Cloudinary configuration
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned

# Cloudflare Turnstile configuration
VUE_APP_TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
VUE_APP_TURNSTILE_TEST_SITE_KEY=1x00000000000000000000AA

# NewsAPI configuration
VUE_APP_NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3
EOF

echo "Installing frontend dependencies..."
npm install

cd ..

# 6. Make ports public in Codespaces
# if [ -n "$CODESPACE_NAME" ]; then
#     echo "Making ports public..."
#     gh codespace ports visibility 8080:public -c $CODESPACE_NAME 2>/dev/null || true
#     gh codespace ports visibility 5173:public -c $CODESPACE_NAME 2>/dev/null || true
# fi

# 7. Verify setup
echo "Verifying setup..."
mysql -u root -e "USE Rent_database; SELECT COUNT(*) as property_count FROM Property;" 2>/dev/null || echo "Database verification failed"

echo ""
echo "Setup completed successfully!"
echo ""
echo "Your URLs:"
echo "   Backend:  https://${CODESPACE_NAME}-8080.app.github.dev"
echo "   Frontend: https://${CODESPACE_NAME}-5173.app.github.dev"
echo ""
echo "To start the application:"
echo "   Terminal 1: cd backend && npm start"
echo "   Terminal 2: cd rentspot-frontend && npm run serve"
echo ""
echo "Test users:"
echo "   Admin: admin@rentspot.com / admin123"
echo "   Landlord: landlord@example.com / password123"
echo "   Renter: renter@example.com / password123"