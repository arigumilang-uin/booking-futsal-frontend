// test-enhanced-features.js
// Comprehensive testing script for enhanced features

import axios from 'axios';

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test users for each role
const TEST_USERS = {
  supervisor: { email: 'ppwweebb01@gmail.com', password: 'futsaluas' },
  manager: { email: 'ppwweebb02@gmail.com', password: 'futsaluas' },
  operator: { email: 'ppwweebb03@gmail.com', password: 'futsaluas' },
  kasir: { email: 'ppwweebb04@gmail.com', password: 'futsaluas' },
  penyewa: { email: 'ppwweebb05@gmail.com', password: 'futsaluas' }
};

// Create axios instance with cookie support
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000
});

let authCookies = {};

// Helper function to login
async function login(userType) {
  try {
    console.log(`\n🔐 Logging in as ${userType}...`);
    const user = TEST_USERS[userType];
    
    const response = await api.post('/auth/login', user);
    
    if (response.data.success) {
      console.log(`✅ Login successful for ${userType}: ${response.data.user.name} (${response.data.user.role})`);
      
      // Store cookies for this user
      if (response.headers['set-cookie']) {
        authCookies[userType] = response.headers['set-cookie'];
      }
      
      return response.data.user;
    } else {
      console.log(`❌ Login failed for ${userType}: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login error for ${userType}: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

// Helper function to set auth cookies
function setAuthCookies(userType) {
  if (authCookies[userType]) {
    api.defaults.headers.Cookie = authCookies[userType].join('; ');
  }
}

// Test notification endpoints
async function testNotifications(userType) {
  console.log(`\n📢 Testing Notifications for ${userType}...`);
  setAuthCookies(userType);
  
  try {
    // Test get notifications
    const notificationsResponse = await api.get('/customer/notifications');
    console.log(`✅ Get notifications: ${notificationsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Notifications count: ${notificationsResponse.data.data?.notifications?.length || 0}`);
    console.log(`   Unread count: ${notificationsResponse.data.data?.unread_count || 0}`);
    
    // Test unread count
    const unreadResponse = await api.get('/customer/notifications/unread-count');
    console.log(`✅ Get unread count: ${unreadResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Unread notifications: ${unreadResponse.data.data?.count || 0}`);
    
  } catch (error) {
    console.log(`❌ Notification test failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test favorites endpoints
async function testFavorites(userType) {
  console.log(`\n❤️ Testing Favorites for ${userType}...`);
  setAuthCookies(userType);
  
  try {
    // Test get favorites
    const favoritesResponse = await api.get('/customer/favorites');
    console.log(`✅ Get favorites: ${favoritesResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Favorites count: ${favoritesResponse.data.data?.favorites?.length || 0}`);
    
    // Test recommendations
    const recommendationsResponse = await api.get('/customer/recommendations');
    console.log(`✅ Get recommendations: ${recommendationsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Recommendations count: ${recommendationsResponse.data.data?.recommendations?.length || 0}`);
    
  } catch (error) {
    console.log(`❌ Favorites test failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test reviews endpoints
async function testReviews(userType) {
  console.log(`\n⭐ Testing Reviews for ${userType}...`);
  setAuthCookies(userType);
  
  try {
    // Test get user reviews
    const reviewsResponse = await api.get('/customer/reviews');
    console.log(`✅ Get user reviews: ${reviewsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Reviews count: ${reviewsResponse.data.data?.reviews?.length || 0}`);
    
    // Test get field reviews (public endpoint)
    const publicReviewsResponse = await api.get('/public/fields/1/reviews');
    console.log(`✅ Get field reviews: ${publicReviewsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.log(`❌ Reviews test failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test promotions endpoints
async function testPromotions(userType) {
  console.log(`\n🎉 Testing Promotions for ${userType}...`);
  setAuthCookies(userType);
  
  try {
    // Test get available promotions
    const promotionsResponse = await api.get('/customer/promotions');
    console.log(`✅ Get promotions: ${promotionsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Promotions count: ${promotionsResponse.data.data?.promotions?.length || 0}`);
    
    // Test promotion history (via bookings with promotions)
    const historyResponse = await api.get('/customer/bookings?has_promotion=true');
    console.log(`✅ Get promotion history: ${historyResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.log(`❌ Promotions test failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test analytics endpoints
async function testAnalytics(userType) {
  console.log(`\n📊 Testing Analytics for ${userType}...`);
  setAuthCookies(userType);

  try {
    let endpoint = '/customer/dashboard';

    // Determine endpoint based on role
    if (['supervisor', 'manager'].includes(userType)) {
      endpoint = '/admin/analytics/business';
    } else if (userType === 'kasir') {
      endpoint = '/staff/kasir/statistics';
    } else if (userType === 'operator') {
      endpoint = '/staff/operator/dashboard';
    }

    const statsResponse = await api.get(endpoint);
    console.log(`✅ Get dashboard stats: ${statsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Stats data:`, Object.keys(statsResponse.data.data || {}));

  } catch (error) {
    console.log(`❌ Analytics test failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test admin features
async function testAdminFeatures(userType) {
  if (!['supervisor', 'manager'].includes(userType)) {
    console.log(`\n⚠️ Skipping admin tests for ${userType} (insufficient permissions)`);
    return;
  }
  
  console.log(`\n👑 Testing Admin Features for ${userType}...`);
  setAuthCookies(userType);
  
  try {
    // Test admin notifications
    const adminNotificationsResponse = await api.get('/admin/notifications');
    console.log(`✅ Get admin notifications: ${adminNotificationsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    
    // Test admin promotions
    const adminPromotionsResponse = await api.get('/admin/promotions');
    console.log(`✅ Get admin promotions: ${adminPromotionsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    
    // Test admin reviews (via customer reviews with admin permissions)
    const adminReviewsResponse = await api.get('/customer/reviews');
    console.log(`✅ Get admin reviews: ${adminReviewsResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.log(`❌ Admin features test failed: ${error.response?.data?.error || error.message}`);
  }
}

// Main test function
async function runEnhancedFeaturesTest() {
  console.log('🚀 ENHANCED FEATURES TESTING STARTED');
  console.log('=====================================');
  
  const testResults = {
    login: {},
    notifications: {},
    favorites: {},
    reviews: {},
    promotions: {},
    analytics: {},
    admin: {}
  };
  
  // Test each user role
  for (const [userType, credentials] of Object.entries(TEST_USERS)) {
    console.log(`\n🎯 TESTING USER ROLE: ${userType.toUpperCase()}`);
    console.log('='.repeat(50));
    
    // Login
    const user = await login(userType);
    testResults.login[userType] = !!user;
    
    if (user) {
      // Test enhanced features
      await testNotifications(userType);
      await testFavorites(userType);
      await testReviews(userType);
      await testPromotions(userType);
      await testAnalytics(userType);
      await testAdminFeatures(userType);
    }
    
    console.log(`\n✅ Completed testing for ${userType}`);
  }
  
  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  console.log('Login Results:', testResults.login);
  
  const successfulLogins = Object.values(testResults.login).filter(Boolean).length;
  const totalUsers = Object.keys(TEST_USERS).length;
  
  console.log(`\n🎉 Enhanced Features Test Completed!`);
  console.log(`📊 Login Success Rate: ${successfulLogins}/${totalUsers} (${(successfulLogins/totalUsers*100).toFixed(1)}%)`);
  
  if (successfulLogins === totalUsers) {
    console.log('✅ All enhanced features are ready for production!');
  } else {
    console.log('⚠️ Some features need attention before production deployment.');
  }
}

// Run the test
runEnhancedFeaturesTest().catch(console.error);

export { runEnhancedFeaturesTest };
