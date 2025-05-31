// Test script for Property API endpoints (manual testing via Postman recommended)
require('dotenv').config();
const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:8080/api';

// Test user credentials (replace with actual test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Test property data
const TEST_PROPERTY = {
  title: 'Test Property',
  price: 500,
  bedrooms: 2,
  bathrooms: 1,
  type: 1, // Apartment
  lat: -34.9285,
  lng: 138.6007,
  image: 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1715754000/rentspot-properties/test.jpg'
};

let token = null;
let createdPropertyId = null;

// Run tests
async function runTests() {
  console.log('Starting Property API tests...\n');
  
  try {
    // 1. Login to get token
    await login();
    
    // 2. Test property creation
    await createProperty();
    
    // 3. Test get all properties
    await getAllProperties();
    
    // 4. Test get property by ID
    if (createdPropertyId) {
      await getPropertyById(createdPropertyId);
    }
    
    // 5. Test update property
    if (createdPropertyId) {
      await updateProperty(createdPropertyId);
    }
    
    // 6. Test get my properties
    await getMyProperties();
    
    // 7. Test delete property
    if (createdPropertyId) {
      await deleteProperty(createdPropertyId);
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\nTests failed:', error.message);
  }
}

// Login to get token
async function login() {
  console.log('Testing login...');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    token = response.data.token;
    console.log('✅ Login successful, token received');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    throw new Error('Login failed, cannot continue tests');
  }
}

// Create a test property
async function createProperty() {
  console.log('\nTesting property creation...');
  
  try {
    const response = await axios.post(
      `${API_URL}/properties`,
      TEST_PROPERTY,
      { headers: { Authorization: token } }
    );
    
    createdPropertyId = response.data.property.id;
    console.log(`✅ Property created successfully with ID: ${createdPropertyId}`);
    return true;
  } catch (error) {
    console.error('❌ Property creation failed:', error.response?.data?.message || error.message);
    throw new Error('Property creation failed');
  }
}

// Get all properties
async function getAllProperties() {
  console.log('\nTesting get all properties...');
  
  try {
    const response = await axios.get(`${API_URL}/properties`);
    console.log(`✅ Retrieved ${response.data.properties.length} properties`);
    return true;
  } catch (error) {
    console.error('❌ Get all properties failed:', error.response?.data?.message || error.message);
    throw new Error('Get all properties failed');
  }
}

// Get property by ID
async function getPropertyById(id) {
  console.log(`\nTesting get property by ID (${id})...`);
  
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    console.log(`✅ Retrieved property: "${response.data.title}"`);
    return true;
  } catch (error) {
    console.error('❌ Get property by ID failed:', error.response?.data?.message || error.message);
    throw new Error('Get property by ID failed');
  }
}

// Update property
async function updateProperty(id) {
  console.log(`\nTesting update property (${id})...`);
  
  const updates = {
    title: `${TEST_PROPERTY.title} (Updated)`,
    price: TEST_PROPERTY.price + 50
  };
  
  try {
    const response = await axios.put(
      `${API_URL}/properties/${id}`,
      updates,
      { headers: { Authorization: token } }
    );
    
    console.log(`✅ Property updated successfully: "${response.data.property.title}"`);
    return true;
  } catch (error) {
    console.error('❌ Update property failed:', error.response?.data?.message || error.message);
    throw new Error('Update property failed');
  }
}

// Get my properties
async function getMyProperties() {
  console.log('\nTesting get my properties...');
  
  try {
    const response = await axios.get(
      `${API_URL}/properties/user/me`,
      { headers: { Authorization: token } }
    );
    
    console.log(`✅ Retrieved ${response.data.properties.length} of my properties`);
    return true;
  } catch (error) {
    console.error('❌ Get my properties failed:', error.response?.data?.message || error.message);
    throw new Error('Get my properties failed');
  }
}

// Delete property
async function deleteProperty(id) {
  console.log(`\nTesting delete property (${id})...`);
  
  try {
    await axios.delete(
      `${API_URL}/properties/${id}`,
      { headers: { Authorization: token } }
    );
    
    console.log('✅ Property deleted successfully');
    
    // Verify deletion
    try {
      await axios.get(`${API_URL}/properties/${id}`);
      console.error('❌ Property still exists after deletion');
      throw new Error('Property deletion verification failed');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Verified property no longer exists');
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Delete property failed:', error.response?.data?.message || error.message);
    throw new Error('Delete property failed');
  }
}

// Run the tests
runTests();

// Instructions for manual testing with Postman:
/*
1. Create a new Postman collection for RentSpot API
2. Set up environment variables:
   - baseUrl: http://localhost:8080/api
   - token: (to be set after login)
3. Create the following requests:
   - POST {{baseUrl}}/auth/login (with body: {"user_email": "...", "user_password": "..."})
   - GET {{baseUrl}}/properties
   - GET {{baseUrl}}/properties/:id
   - POST {{baseUrl}}/properties (with body and Authorization header)
   - PUT {{baseUrl}}/properties/:id (with body and Authorization header)
   - DELETE {{baseUrl}}/properties/:id (with Authorization header)
   - GET {{baseUrl}}/properties/user/me (with Authorization header)
   - POST {{baseUrl}}/properties/upload (with form-data and Authorization header)
4. Use a "Tests" script in the login request to set the token environment variable:
   pm.environment.set("token", pm.response.json().token);
*/