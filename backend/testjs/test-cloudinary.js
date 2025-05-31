// Test script for Cloudinary integration
require('dotenv').config();
const cloudinary = require('./config/cloudinary');

async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  
  try {
    // Simple ping test - just list one resource
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful!');
    console.log('Response:', result);
    
    console.log('\nCloudinary configuration:');
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY);
    console.log('API Secret:', `${process.env.CLOUDINARY_API_SECRET.substring(0, 3)}...` + '[HIDDEN]');
    
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
    return false;
  }
}

// Run the test
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('\nAll tests passed! Cloudinary is properly configured.');
    } else {
      console.error('\nTests failed! Please check your Cloudinary configuration.');
    }
  })
  .catch(error => {
    console.error('Unexpected error during testing:', error);
  });