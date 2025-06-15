#!/bin/bash

# Auto-detect and set API URL for Codespaces
# This script runs after container creation to configure frontend API URL

echo "Configuring API URL for Codespaces..."

# Get the current Codespaces URL
CODESPACE_NAME=$(echo $CODESPACE_NAME)
if [ -n "$CODESPACE_NAME" ]; then
    # Extract the base URL from environment
    BASE_URL="https://${CODESPACE_NAME}-8080.app.github.dev"
    API_URL="${BASE_URL}/api"
    
    echo "Detected Codespaces environment"
    echo "Setting API URL to: $API_URL"
    
    # Update frontend .env
    cd /workspaces/*/rentspot-frontend
    sed -i "s|VUE_APP_API_BASE_URL=|VUE_APP_API_BASE_URL=${API_URL}|" .env
    
    echo "Frontend .env updated with Codespaces API URL"
else
    # Local development
    echo "Local development detected, using localhost API"
    cd /workspaces/*/rentspot-frontend 2>/dev/null || cd */rentspot-frontend 2>/dev/null || cd rentspot-frontend
    sed -i "s|VUE_APP_API_BASE_URL=|VUE_APP_API_BASE_URL=http://localhost:8080/api|" .env
fi

echo "API URL configuration complete!"