# Group Repository for COMP SCI 2207/7207 Web & Database Computing Web Application Project (2023 Semester 1)

Your group's shared repository for the WDC 2023 Web App Project.

Auto commit/push/sync to Github is disabled by default in this repository.
- Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)

See [HERE](https://myuni.adelaide.edu.au/courses/85266/pages/2023-web-application-group-project-specification) for the project specification.

We recommend using the 'Shared Repository Model (Branch & Pull)' to collaborate on your work in this single repostory.
- You can read more about collaborating on GitHub repositories [HERE](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- When working on the same file at the same time, the 'Live Share' feature in VSCode can also help.
# RentSpot - Property Rental Platform

## Project Description

RentSpot is a web-based property rental application developed for COMP SCI 2207/7207 Web & Database Computing. The platform connects property seekers with landlords, allowing users to search for rental properties, book inspections, and manage property listings across Australia.

This project demonstrates full-stack web development using modern technologies including Vue.js (with Vue CLI), Node.js, and MySQL, with integration of third-party APIs for enhanced functionality.

**Note**: This project uses Vue CLI instead of Vite to comply with course requirements. All environment variables use the `VUE_APP_` prefix.

## Setup Instructions

### Prerequisites
- Node.js (v16.0 or higher)
- MySQL (v8.0 or higher) - *Not required for Codespaces*
- Git
- Modern web browser

### Quick Setup for GitHub Codespaces
Run this command from the project root to set up everything:

```bash
bash -c "sudo apt update && sudo apt install -y mysql-server && sudo service mysql start && sudo mysql -e 'ALTER USER \"root\"@\"localhost\" IDENTIFIED WITH mysql_native_password BY \"\"; FLUSH PRIVILEGES;' && mysql -u root -e 'CREATE DATABASE Rent_database;' && mysql -u root Rent_database < backend/Rent_database_updated.sql && cd backend && npm install && cd ../rentspot-frontend && npm install"
```

### 1. Database Setup

#### For Local Development:
```bash
mysql -u root -p
CREATE DATABASE Rent_database;
USE Rent_database;
SOURCE backend/Rent_database_updated.sql;
```

#### For GitHub Codespaces:
```bash
# Install and start MySQL
sudo apt update
sudo apt install -y mysql-server
sudo service mysql start

# Configure MySQL
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Create database
mysql -u root -e "CREATE DATABASE Rent_database;"
mysql -u root Rent_database < backend/Rent_database_updated.sql
```

### 2. Backend Configuration

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Ljl12345!  # Leave empty for Codespaces: DB_PASSWORD=
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

API_BASE_URL=http://localhost:8080/api
NODE_ENV=development
```

Create `.env` file in the frontend directory (`rentspot-frontend/.env`):
```env
VUE_APP_API_BASE_URL=http://localhost:8080/api
VUE_APP_CLOUDINARY_CLOUD_NAME=dzxrmtus9
VUE_APP_CLOUDINARY_UPLOAD_PRESET=rentspot_unsigned
```

**Note for Codespaces**: Set `DB_PASSWORD=` (empty) in the backend .env file.

### 3. Start the Application

Start the backend server:
```bash
cd backend
npm start
```
Backend runs at: `http://localhost:8080`

Start the frontend server:
```bash
cd rentspot-frontend
npm install
npm run serve
```
Frontend runs at: `http://localhost:5173`

### 4. Test Accounts

Pre-configured test accounts (password: `11111111` for all):

| Email | Role | Access |
|-------|------|--------|
| test@example.com | Landlord | Property management, booking views |
| Jarvis@example.com | Renter | Property search, booking creation |
| admin@example.com | Admin | Full system access |

## Features and Functionality

### Core Features
- **User Authentication**: Registration, login, and profile management with JWT tokens
- **Multi-role System**: Support for renters, landlords, and administrators
- **Property Management**: Create, edit, and manage property listings with image uploads
- **Advanced Search**: Filter properties by price, location, type, and amenities
- **Multiple View Modes**: Grid view, list view, and interactive map view
- **Booking System**: Schedule property inspections with automated time slot generation
- **Favorites System**: Save and manage favorite properties
- **Responsive Design**: Mobile-optimized interface with dark mode support

### Technical Implementation
- **Frontend**: Vue.js 3 with custom routing system
- **Backend**: Node.js + Express.js RESTful API
- **Database**: MySQL with normalized schema design
- **Authentication**: JWT-based sessions with bcrypt password hashing
- **File Storage**: Cloudinary integration for image management
- **Maps Integration**: Google Maps API for location services
- **Security**: CAPTCHA protection via Cloudflare Turnstile

### User Roles and Permissions

#### Renters
- Browse and search properties
- Book property inspections
- Manage favorites and bookings
- Update profile information

#### Landlords
- Create and manage property listings
- Upload multiple property images
- View and manage inspection bookings
- Track property performance

#### Administrators
- Manage all users and properties
- View system statistics
- Change user roles
- Delete accounts and properties

## API Documentation

### Authentication
```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
```

### User Management
```
GET    /api/users/profile     - Get user profile
PUT    /api/users/profile     - Update profile
POST   /api/users/avatar      - Upload profile picture
POST   /api/users/change-password - Change password
GET    /api/users/favorites   - Get favorite properties
```

### Properties
```
GET    /api/properties        - List properties with filters
GET    /api/properties/:id    - Get property details
POST   /api/properties        - Create new property
PUT    /api/properties/:id    - Update property
DELETE /api/properties/:id    - Delete property
POST   /api/properties/upload-multiple - Upload property images
```

### Bookings
```
GET    /api/bookings/slots/:propertyId - Get available time slots
GET    /api/bookings          - Get user bookings
POST   /api/bookings          - Create booking
PUT    /api/bookings/:id      - Update booking status
DELETE /api/bookings/:id      - Cancel booking
```

### Admin
```
GET    /api/admin/users       - List all users
PUT    /api/admin/users/:id/role - Change user role
GET    /api/admin/stats       - Get system statistics
DELETE /api/admin/users/:id   - Delete user
```

## Database Structure

The database follows Third Normal Form (3NF) principles with the following main tables:

- **Users**: User accounts with role-based access
- **Properties**: Property listings with location and details
- **PropertyImages**: Multiple images per property with ordering
- **Bookings**: Inspection appointments with status tracking
- **Favorites**: User's saved properties
- **News**: Real estate news and updates

Key relationships include foreign key constraints and indexes for optimal query performance.

## Known Issues

### Current Bugs
1. **Map View Marker Overlap**: When properties have the same location, map markers overlap and only one property can be viewed
2. **Dark Mode Mobile Toggle**: On mobile devices, the dark mode toggle requires two taps to switch themes
3. **Edit Property Images**: Cannot view existing uploaded image URLs in the property edit modal
4. **Cloudflare Turnstile Limitation**: CAPTCHA functionality unavailable in Codespaces due to API domain restrictions

### UI/UX Issues
5. **Toast Notification Positioning**: Toast messages appear over the navbar, affecting user experience
6. **Toast Notification Styling**: Notifications display in black/white instead of red due to dark mode global styles conflicts
7. **Search Filter Persistence**: Filter selections reset when navigating between pages due to different developers working on separate interfaces



## What We Learned

Through this project, we gained hands-on experience with:
- Full-stack web development using modern JavaScript frameworks
- Database design and normalization principles
- RESTful API development and integration
- User authentication and authorization systems
- Third-party API integration (Cloudinary, Google Maps)
- Team collaboration using Git branching strategies
- Responsive web design and mobile optimization

## Contributors

| Name | Role | Primary Responsibilities |
|------|------|-------------------------|
| **Jialao (Jarvis)** | Full-Stack Lead | Backend API development, database design, authentication system, frontend integration, documentation, project maintenance |
| **Nhat Tan (Trey)** | Frontend Lead | UI/UX design, Vue.js components, responsive layouts, user interface development |
| **Deze Yang** | Frontend Assistant | frontend contributions on mock data in news.vue|

## Development Notes

- The project uses a custom Vue.js router implementation instead of Vue Router
- All API endpoints follow RESTful conventions
- Database connections use connection pooling for performance
- Images are stored on Cloudinary CDN for optimal loading
- The application supports both light and dark themes
- Mobile-first responsive design approach was used throughout

## Running Tests

To test the application functionality:

1. **User Registration**: Create accounts with different roles
2. **Property Management**: Add properties with multiple images as a landlord
3. **Search and Booking**: Search properties and book inspections as a renter
4. **Admin Functions**: Manage users and view statistics as an admin
5. **Responsive Testing**: Test on different screen sizes and devices

Environment-Specific Testing Notes
Registration and Login Differences:

Local Development (localhost:5173): Full functionality including Cloudflare Turnstile CAPTCHA protection during registration
GitHub Codespaces: CAPTCHA functionality is disabled due to Cloudflare Turnstile API domain restrictions. Registration will work without CAPTCHA verification

Testing Recommendations:

For localhost testing: Test both successful and failed CAPTCHA scenarios during registration
For Codespaces testing: Focus on other functionality since CAPTCHA is bypassed
Use the provided test accounts for immediate access to different user roles
Test responsive design on both desktop and mobile viewports

The application includes comprehensive error handling and user feedback through toast notifications.

## Development Notes

- All team members must work on their assigned branches (see below)
- Code reviews required for all pull requests
- Follow JavaScript semicolon conventions for consistency

# RentSpot AU - Git Branch Usage Guide

To ensure clean collaboration, **each team member must work on their own branch**.
**Never commit directly to the `main` branch.** All changes must go through pull requests (PRs).

## Assigned Development Branches

Current dev branches for each member:

- Jialao: dev/jialao
- Nhat Tan: dev/nhattan
- Deze: dev/deze

## Step 1: Create Your Branch (One-time setup)

Start from the latest `main` branch:

```bash
git checkout main
git pull origin main

git checkout -b dev/yourname
git push -u origin dev/yourname
```

Replace `yourname` with your actual name or alias.

## Step 2: Keep Your Branch Updated with `main`

Before you start working, always sync with the latest `main` to avoid conflicts:

```bash
git checkout main
git pull origin main

git checkout dev/yourname
git rebase main        # or: git merge main
```

If conflicts occur, fix them, then:

```bash
git add .
git rebase --continue
```

Then push your updated branch:

```bash
git push -f     # Use force push only after rebase
```

## Step 3: Commit and Push Your Changes

```bash
git add .
git commit -m "feat: add login page"
git push
```

## Step 4: Submit a Pull Request (PR)

After finishing your task:

1. Go to the GitHub repository
2. Click "Compare & pull request"
3. Fill in PR title and description (e.g., what changed, what was tested)
4. Submit PR → team lead will review and merge

## Step 5: How to Sync main into Your Branch When Behind

If your branch shows something like "33 commits behind main":

1. Go to the repository on GitHub
2. Switch to your branch (e.g., dev/jialao)
3. Click "Compare & pull request" (if available) to merge main into your branch

Or use terminal commands:
```bash
git checkout dev/yourname
git pull origin main
git push origin dev/yourname
```

## Notes

- Never commit or push directly to `main`
- Always work in your own branch (e.g., `dev/yournanme`)
- Sync with `main` regularly using rebase or merge
- All changes must go through a PR

If your branch shows **"nothing to compare"** when opening a PR, it means your branch was not created from the latest `main`. Please recreate your branch correctly or contact Jialao for help.

## Development Environment Setup

### Required Software
- Node.js (v16+)
- Visual Studio Code
- Git

### Project Setup

1. Install dependencies
```bash
npm install
```

2. Start the local development server
```bash
npm run serve
```
The project will automatically run at:
http://localhost:5173/

If you want to allow other devices on your local network to access it, the host is already enabled by default.

## Code Standards

### JavaScript Code Style Guide (.js files)

To ensure code consistency (and avoid errors during school computer demonstrations), please follow these JavaScript coding standards:

#### Basic Rules

- **Semicolons**
  Always add a semicolon (;) at the end of each statement to avoid potential issues caused by Automatic Semicolon Insertion (ASI).

---

Maintained: **Jialao(Jarvis)**
