#!/bin/bash

# DevContainer setup script for RentSpot project
# Fixes path resolution issues in Codespaces

echo "Starting RentSpot DevContainer Setup..."

# Determine the correct workspace path
WORKSPACE_PATH="/workspaces/25S1_WDC_New_UG_Groups_1"
if [ ! -d "$WORKSPACE_PATH" ]; then
    # Fallback to first directory in /workspaces/
    WORKSPACE_PATH=$(find /workspaces -maxdepth 1 -type d -name "*WDC*" | head -1)
    if [ -z "$WORKSPACE_PATH" ]; then
        WORKSPACE_PATH="/workspaces/$(ls /workspaces | head -1)"
    fi
fi

echo "Using workspace path: $WORKSPACE_PATH"

# 1. Start MySQL service
echo "Starting MySQL service..."
service mysql start
sleep 5

# 2. Create database
echo "Creating database if not exists..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS Rent_database;"

# 3. Import SQL file if exists
SQL_FILE="$WORKSPACE_PATH/backend/Rent_database_updated.sql"
if [ -f "$SQL_FILE" ]; then
    echo "Importing Rent_database_updated.sql..."
    mysql -u root Rent_database < "$SQL_FILE"
else
    echo "Rent_database_updated.sql not found at $SQL_FILE, skipping import."
fi

# 4. Create backend .env file
echo "Generating backend .env file..."
BACKEND_DIR="$WORKSPACE_PATH/backend"
mkdir -p "$BACKEND_DIR"

cat > "$BACKEND_DIR/.env" << 'EOF'
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

echo "Backend .env created successfully"

# 5. Install backend dependencies
echo "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

# 6. Create frontend .env file
echo "Generating frontend .env file..."
FRONTEND_DIR="$WORKSPACE_PATH/rentspot-frontend"
mkdir -p "$FRONTEND_DIR"

cat > "$FRONTEND_DIR/.env" << 'EOF'
VUE_APP_API_BASE_URL=
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned
VUE_APP_TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
VUE_APP_TURNSTILE_TEST_SITE_KEY=1x00000000000000000000AA
EOF

echo "Frontend .env created successfully"

# 7. Install frontend dependencies
echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

# 8. Configure API URL for Codespaces
echo "Configuring API URL..."
if [ -n "$CODESPACE_NAME" ]; then
    BASE_URL="https://${CODESPACE_NAME}-8080.app.github.dev"
    API_URL="${BASE_URL}/api"
    echo "Detected Codespaces environment"
    echo "Setting API URL to: $API_URL"
    sed -i "s|VUE_APP_API_BASE_URL=|VUE_APP_API_BASE_URL=${API_URL}|" "$FRONTEND_DIR/.env"
    echo "Frontend .env updated with Codespaces API URL"
else
    echo "Local development detected, using localhost API"
    sed -i "s|VUE_APP_API_BASE_URL=|VUE_APP_API_BASE_URL=http://localhost:8080/api|" "$FRONTEND_DIR/.env"
    echo "Frontend .env updated with localhost API URL"
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "   Backend:  cd backend && npm start"
echo "   Frontend: cd rentspot-frontend && npm run serve"
echo ""
echo "Access URLs:"
echo "   Frontend: http://localhost:5173 (local) or Codespace port 5173"
echo "   Backend:  http://localhost:8080 (local) or Codespace port 8080"