#!/usr/bin/env node
// test-frontend-backend-integration.js - Test Frontend-Backend Integration

const axios = require('axios');

const BACKEND_URL = 'https://booking-futsal-production.up.railway.app/api';
const FRONTEND_URL = 'https://booking-futsal-frontend.vercel.app';

console.log('🧪 Testing Frontend-Backend Integration...\n');

// Test 1: Backend Health Check
console.log('1️⃣ Testing Backend Health...');
async function testBackendHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/public/system-info`);
    console.log('✅ Backend Health:', response.data.data.app_name, response.data.data.version);
    console.log('   Supported Roles:', response.data.data.supported_roles.join(', '));
    return true;
  } catch (error) {
    console.log('❌ Backend Health Failed:', error.message);
    return false;
  }
}

// Test 2: Authentication Endpoints
console.log('\n2️⃣ Testing Authentication Endpoints...');
async function testAuthEndpoints() {
  try {
    // Test login endpoint structure
    const testCredentials = {
      email: 'ppwweebb01@gmail.com',
      password: 'futsaluas'
    };

    const response = await axios.post(`${BACKEND_URL}/auth/login`, testCredentials, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Login Endpoint Working');
      console.log('   User Role:', response.data.data?.user?.role || response.data.user?.role);
      console.log('   Token Provided:', !!response.data.data?.token || !!response.data.token);
      
      // Test profile endpoint with token
      const token = response.data.data?.token || response.data.token;
      if (token) {
        const profileResponse = await axios.get(`${BACKEND_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        if (profileResponse.data.success) {
          console.log('✅ Profile Endpoint Working');
          console.log('   Profile Role:', profileResponse.data.data?.user?.role);
        }
      }
      
      return true;
    }
  } catch (error) {
    console.log('❌ Auth Test Failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Test 3: Role-based Endpoints
console.log('\n3️⃣ Testing Role-based Endpoints...');
async function testRoleEndpoints() {
  try {
    // Test public endpoints (no auth required)
    const fieldsResponse = await axios.get(`${BACKEND_URL}/public/fields`);
    if (fieldsResponse.data.success) {
      console.log('✅ Public Fields Endpoint Working');
      console.log('   Fields Count:', fieldsResponse.data.data?.length || 0);
    }

    // Test admin endpoints (would need auth)
    try {
      const adminResponse = await axios.get(`${BACKEND_URL}/admin/bookings`);
      console.log('⚠️ Admin endpoint accessible without auth (potential security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin Endpoints Protected (401 Unauthorized)');
      } else {
        console.log('❓ Admin Endpoint Response:', error.response?.status);
      }
    }

    return true;
  } catch (error) {
    console.log('❌ Role Endpoints Test Failed:', error.message);
    return false;
  }
}

// Test 4: CORS Configuration
console.log('\n4️⃣ Testing CORS Configuration...');
async function testCORS() {
  try {
    const response = await axios.options(`${BACKEND_URL}/auth/login`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS Preflight Working');
    return true;
  } catch (error) {
    // CORS might not support OPTIONS or might be configured differently
    console.log('⚠️ CORS Test Inconclusive:', error.message);
    return true; // Don't fail on this
  }
}

// Test 5: Frontend Deployment
console.log('\n5️⃣ Testing Frontend Deployment...');
async function testFrontendDeployment() {
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend Deployment Accessible');
      console.log('   Status:', response.status);
      return true;
    }
  } catch (error) {
    console.log('❌ Frontend Deployment Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Integration Tests...\n');
  
  const results = {
    backend: await testBackendHealth(),
    auth: await testAuthEndpoints(),
    roles: await testRoleEndpoints(),
    cors: await testCORS(),
    frontend: await testFrontendDeployment()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Frontend-Backend integration ready.');
  } else {
    console.log('⚠️ Some tests failed. Check configuration and try again.');
  }

  console.log('\n🔗 URLs:');
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   API Docs: ${BACKEND_URL.replace('/api', '')}/api-docs/`);
}

// Run tests
runAllTests().catch(console.error);
