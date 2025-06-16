#!/bin/bash

# RentSpot Codespaces Setup

# Backend setup
cd backend

if [ -n "$CODESPACE_NAME" ]; then
    DB_HOST="127.0.0.1"
    FRONTEND_URL="https://${CODESPACE_NAME}-5173.app.github.dev"
else
    DB_HOST="localhost"
    FRONTEND_URL="http://localhost:5173"
fi

cat > .env << EOF
DB_HOST=$DB_HOST
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
NODE_ENV=development
FRONTEND_URL=$FRONTEND_URL
EOF

npm install

cd ..

# Frontend setup
cd rentspot-frontend

if [ -n "$CODESPACE_NAME" ]; then
    API_URL="https://${CODESPACE_NAME}-8080.app.github.dev/api"
else
    API_URL="http://localhost:8080/api"
fi

cat > .env << EOF
VUE_APP_API_BASE_URL=$API_URL
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned
VUE_APP_TURNSTILE_SITE_KEY=0x4AAAAAABdkinnD2a45uxc0
VUE_APP_TURNSTILE_TEST_SITE_KEY=1x00000000000000000000AA
VUE_APP_NEWS_API_KEY=d9b129de2e5e432e8315073b3e294fc3
EOF

npm install

cd ..

# Make ports public in Codespaces
if [ -n "$CODESPACE_NAME" ]; then
    gh codespace ports visibility 8080:public -c $CODESPACE_NAME 2>/dev/null || true
    gh codespace ports visibility 5173:public -c $CODESPACE_NAME 2>/dev/null || true
fi