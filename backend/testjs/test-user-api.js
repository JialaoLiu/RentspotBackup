require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// API base URL
const API_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';

// Test user credentials (replace with actual test user)
const TEST_USER = {
  user_email: 'Jarvis001@example.com',
  user_password: '11111111' // 明文密码
};

// Path to test avatar image
const TEST_AVATAR_PATH = path.join(__dirname, 'testassets', 'test-avatar.jpg');

// Check if test avatar image exists
if (!fs.existsSync(TEST_AVATAR_PATH)) {
  console.error(`Test avatar image not found at ${TEST_AVATAR_PATH}`);
  const testAssetsDir = path.join(__dirname, 'testassets');
  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }
  console.log('Please place a test image at:', TEST_AVATAR_PATH);
  process.exit(1);
}

let token = null;

// Main test runner
async function runTests() {
  console.log('Starting User Profile API tests...\n');
  try {
    await login();
    await getUserProfile();
    await updateUserProfile();
    await uploadAvatar();
    await changePassword();
    await getFavoriteProperties();
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\nTests failed:', error.message);
  }
}

// Login and retrieve JWT
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

// Fetch user profile
async function getUserProfile() {
  console.log('\nTesting get user profile...');
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved successfully:');
    console.log(`   Name: ${response.data.name}`);
    console.log(`   Email: ${response.data.email}`);
    console.log(`   Avatar URL: ${response.data.avatarUrl || 'None'}`);
    return true;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data?.message || error.message);
    throw new Error('Get profile failed');
  }
}

// Update user profile
async function updateUserProfile() {
  console.log('\nTesting update user profile...');
  const updates = {
    name: `Test User ${new Date().toISOString().slice(0, 10)}`,
    phone: '0400111222'
  };
  try {
    const response = await axios.put(`${API_URL}/users/profile`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile updated successfully:');
    console.log(`   Updated name: ${response.data.user.name}`);
    console.log(`   Updated phone: ${response.data.user.phone}`);
    return true;
  } catch (error) {
    console.error('❌ Update profile failed:', error.response?.data?.message || error.message);
    throw new Error('Update profile failed');
  }
}

// Upload user avatar
async function uploadAvatar() {
  console.log('\nTesting upload avatar...');
  try {
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(TEST_AVATAR_PATH));
    const response = await axios.post(`${API_URL}/users/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    console.log('✅ Avatar uploaded successfully:');
    console.log(`   New avatar URL: ${response.data.avatarUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Upload avatar failed:', error.response?.data?.message || error.message);
    throw new Error('Upload avatar failed');
  }
}

// Optional password change (disabled by default)
async function changePassword() {
  console.log('\nTesting change password...');
  console.log('⚠️ Skipping actual password change to preserve test account');
  return true;

  // Uncomment below to test password change
  /*
  try {
    await axios.post(`${API_URL}/users/change-password`, {
      currentPassword: TEST_USER.user_password,
      newPassword: TEST_USER.user_password
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Password changed successfully');
    return true;
  } catch (error) {
    console.error('❌ Change password failed:', error.response?.data?.message || error.message);
    throw new Error('Change password failed');
  }
  */
}

// Fetch user favorites
async function getFavoriteProperties() {
  console.log('\nTesting get favorite properties...');
  try {
    const response = await axios.get(`${API_URL}/users/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Favorites retrieved successfully:');
    console.log(`   Total favorites: ${response.data.favorites.length}`);
    if (response.data.favorites.length > 0) {
      const sample = response.data.favorites[0];
      console.log('   Sample favorite:');
      console.log(`     Title: ${sample.title}`);
      console.log(`     Price: $${sample.price}/week`);
    }
    return true;
  } catch (error) {
    console.error('❌ Get favorites failed:', error.response?.data?.message || error.message);
    throw new Error('Get favorites failed');
  }
}

// Postman instructions
console.log(`
=== Instructions for manual testing with Postman ===
1. Create a new Postman collection for RentSpot User API
2. Set environment variables:
   - baseUrl: ${API_URL}
   - token: (to be set after login)
3. Create requests:
   - POST {{baseUrl}}/auth/login
   - GET {{baseUrl}}/users/profile
   - PUT {{baseUrl}}/users/profile
   - POST {{baseUrl}}/users/avatar
   - POST {{baseUrl}}/users/change-password
   - GET {{baseUrl}}/users/favorites
4. Use "Tests" script in login to auto set token:
   pm.environment.set("token", pm.response.json().token);
`);

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  login,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  changePassword,
  getFavoriteProperties
};