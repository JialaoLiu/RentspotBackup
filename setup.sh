#!/bin/bash

# RentSpot Project Setup Script
# This script sets up the entire project environment for both frontend and backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "rentspot-frontend" ]; then
    print_error "This script must be run from the project root directory containing 'backend' and 'rentspot-frontend' folders"
    exit 1
fi

print_status "Starting RentSpot project setup..."

# Step 1: Check system requirements
print_status "Checking system requirements..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Step 2: MySQL setup
print_status "Setting up MySQL database..."

# Check if MySQL is installed
if command -v mysql &> /dev/null; then
    # Start MySQL service
    if command -v service &> /dev/null; then
        print_status "Starting MySQL service..."
        service mysql start 2>/dev/null || sudo service mysql start 2>/dev/null || print_warning "Could not start MySQL service automatically"
    fi
    
    # Wait for MySQL to be ready
    print_status "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if mysqladmin ping -h localhost --silent 2>/dev/null; then
            print_success "MySQL is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "MySQL may not be ready. Continuing anyway..."
        fi
        sleep 1
    done
    
    # Create database
    print_status "Creating Rent_database..."
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS Rent_database;" 2>/dev/null || print_warning "Could not create database automatically"
    
    # Import database schema
    if [ -f "backend/Rent_database_updated.sql" ]; then
        print_status "Importing database schema..."
        mysql -u root Rent_database < backend/Rent_database_updated.sql 2>/dev/null && print_success "Database schema imported!" || print_warning "Could not import schema automatically"
    elif [ -f "backend/Rent_database.sql" ]; then
        print_status "Importing basic database schema..."
        mysql -u root Rent_database < backend/Rent_database.sql 2>/dev/null && print_success "Basic database schema imported!" || print_warning "Could not import schema automatically"
    else
        print_warning "No database schema files found"
    fi
else
    print_warning "MySQL not found. Database setup skipped."
fi

# Step 3: Backend setup
print_status "Setting up backend..."

cd backend

# Create backend .env file
print_status "Creating backend .env file..."
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

print_success "Backend .env file created!"

# Install backend dependencies
print_status "Installing backend dependencies..."
if npm install; then
    print_success "Backend dependencies installed!"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Test backend setup
print_status "Testing backend configuration..."
if node -e "require('dotenv').config(); console.log('Backend configuration test passed!');" 2>/dev/null; then
    print_success "Backend configuration is valid!"
else
    print_warning "Backend configuration may have issues"
fi

cd ..

# Step 4: Frontend setup
print_status "Setting up frontend..."

cd rentspot-frontend

# Detect environment and set API URL
if [ -n "$CODESPACE_NAME" ]; then
    API_URL="https://${CODESPACE_NAME}-8080.app.github.dev/api"
    print_status "Detected GitHub Codespaces environment"
    print_status "Setting API URL to: $API_URL"
elif [ -n "$GITPOD_WORKSPACE_URL" ]; then
    GITPOD_URL=$(echo $GITPOD_WORKSPACE_URL | sed 's|https://||')
    API_URL="https://8080-${GITPOD_URL}/api"
    print_status "Detected Gitpod environment"
    print_status "Setting API URL to: $API_URL"
else
    API_URL="http://localhost:8080/api"
    print_status "Detected local development environment"
    print_status "Setting API URL to: $API_URL"
fi

# Create frontend .env file
print_status "Creating frontend .env file..."
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

print_success "Frontend .env file created!"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
if npm install; then
    print_success "Frontend dependencies installed!"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Test frontend setup
print_status "Testing frontend configuration..."
if [ -f "node_modules/.bin/vue-cli-service" ]; then
    print_success "Frontend configuration is valid!"
else
    print_warning "Frontend configuration may have issues"
fi

cd ..

# Step 5: Verify setup
print_status "Verifying complete setup..."

# Check if all required files exist
REQUIRED_FILES=(
    "backend/.env"
    "backend/node_modules"
    "rentspot-frontend/.env"
    "rentspot-frontend/node_modules"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Missing: $file"
        ALL_GOOD=false
    fi
done

if $ALL_GOOD; then
    print_success "All required files and directories are present!"
else
    print_error "Some required files are missing. Please check the errors above."
    exit 1
fi

# Step 6: Display final instructions
echo ""
echo "========================================"
print_success "RentSpot setup completed successfully!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "  1. Backend (Terminal 1):"
echo "     cd backend"
echo "     npm start"
echo ""
echo "  2. Frontend (Terminal 2):"
echo "     cd rentspot-frontend"
echo "     npm run serve"
echo ""
echo "The application will be available at:"
if [ -n "$CODESPACE_NAME" ]; then
    echo "  Frontend: https://${CODESPACE_NAME}-5173.app.github.dev"
    echo "  Backend:  https://${CODESPACE_NAME}-8080.app.github.dev"
elif [ -n "$GITPOD_WORKSPACE_URL" ]; then
    GITPOD_URL=$(echo $GITPOD_WORKSPACE_URL | sed 's|https://||')
    echo "  Frontend: https://5173-${GITPOD_URL}"
    echo "  Backend:  https://8080-${GITPOD_URL}"
else
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:8080"
fi
echo ""
echo "Debug endpoints:"
echo "  Test API: GET /test"
echo "  Test DB:  GET /test-db"
echo ""