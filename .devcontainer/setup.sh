#!/bin/bash
set -e

echo "Starting RentSpot Codespaces setup..."

# Start MySQL service
echo "Starting MySQL..."
service mysql start
sleep 10

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until mysqladmin ping -h localhost --silent; do
    echo "MySQL is not ready, waiting..."
    sleep 2
done

echo "MySQL is ready!"

# Create database
echo "Creating Rent_database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS Rent_database;"

# Check if SQL file exists and import it
if [ -f "/workspaces/25S1_WDC_New_UG_Groups_1/backend/Rent_database_updated.sql" ]; then
    echo "Importing database schema..."
    mysql -u root Rent_database < /workspaces/25S1_WDC_New_UG_Groups_1/backend/Rent_database_updated.sql
    echo "Database imported successfully!"
else
    echo "SQL file not found, checking alternative location..."
    if [ -f "/workspaces/25S1_WDC_New_UG_Groups_1/backend/Rent_database.sql" ]; then
        mysql -u root Rent_database < /workspaces/25S1_WDC_New_UG_Groups_1/backend/Rent_database.sql
        echo "Basic database imported!"
    else
        echo "No SQL files found, creating empty database"
    fi
fi

# Create backend .env file
echo "Creating backend .env file..."
cd /workspaces/25S1_WDC_New_UG_Groups_1/backend

cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=Rent_database
DB_PORT=3306

# JWT Secret
JWT_SECRET=00ae84691b5cc7bb6ca21e11779bc0cefb5ed62d1b7331a71ea0628e7f2c98d54331b54f3c67084bc2ec0e78e9ef21473b9b575eb7e8336dc5faebdafb44dacf

# Server Port
PORT=8080

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=dzxrmtus9
CLOUDINARY_API_KEY=138993529279886
CLOUDINARY_API_SECRET=23CK6Atf0I_PolCywakizy-PJU8

# Cloudflare Turnstile credentials
TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
TURNSTILE_SECRET_KEY=0x4AAAAAABdkii48VRRJP3Cb8Ggbml6zNyQ

# NewsAPI Configuration
NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3

# Other configuration
NODE_ENV=development
EOF

echo "Backend .env created!"

# Install backend dependencies
echo "Installing backend dependencies..."
npm install
echo "Backend dependencies installed!"

# Create frontend .env and install dependencies
echo "Setting up frontend..."
cd /workspaces/25S1_WDC_New_UG_Groups_1/rentspot-frontend

# Get Codespace URL for API
if [ -n "$CODESPACE_NAME" ]; then
    API_URL="https://${CODESPACE_NAME}-8080.app.github.dev/api"
    echo "Detected Codespaces, setting API URL to: $API_URL"
else
    API_URL="http://localhost:8080/api"
    echo "Local development, setting API URL to: $API_URL"
fi

cat > .env << EOF
# API Base URL
VUE_APP_API_BASE_URL=$API_URL

# Cloudinary configuration
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned

# Cloudflare Turnstile configuration
VUE_APP_TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
VUE_APP_TURNSTILE_TEST_SITE_KEY=1x00000000000000000000AA

# NewsAPI configuration
VUE_APP_NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3
EOF

echo "Frontend .env created!"

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install
echo "Frontend dependencies installed!"

# Test database connection
echo "Testing database connection..."
cd /workspaces/25S1_WDC_New_UG_Groups_1/backend
if node -e "const db = require('./config/db'); db.query('SELECT 1').then(() => { console.log('Database connection successful!'); process.exit(0); }).catch(err => { console.error('Database connection failed:', err.message); process.exit(1); })"; then
    echo "Database test passed!"
else
    echo "Database test failed, but continuing..."
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && npm start"
echo "  Frontend: cd rentspot-frontend && npm run serve"
echo ""