// src/utils/developmentTest.js
// Development Environment Integration Test

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Test development environment integration
 */
export async function testDevelopmentEnvironment() {
  console.log('🧪 Starting Development Environment Test...\n');
  
  const results = {
    environment: false,
    backend: false,
    authentication: false,
    booking: false,
    errors: []
  };

  try {
    // Test 1: Environment Configuration
    console.log('1️⃣ Testing Environment Configuration...');
    const envTest = testEnvironmentConfig();
    results.environment = envTest.success;
    if (!envTest.success) {
      results.errors.push(...envTest.errors);
    }
    console.log(envTest.success ? '✅ Environment OK' : '❌ Environment Issues');

    // Test 2: Backend Connectivity
    console.log('\n2️⃣ Testing Backend Connectivity...');
    const backendTest = await testBackendHealth();
    results.backend = backendTest.success;
    if (!backendTest.success) {
      results.errors.push(...backendTest.errors);
    }
    console.log(backendTest.success ? '✅ Backend OK' : '❌ Backend Issues');

    // Test 3: Authentication Flow
    if (results.backend) {
      console.log('\n3️⃣ Testing Authentication Flow...');
      const authTest = await testAuthenticationFlow();
      results.authentication = authTest.success;
      if (!authTest.success) {
        results.errors.push(...authTest.errors);
      }
      console.log(authTest.success ? '✅ Authentication OK' : '❌ Authentication Issues');

      // Test 4: Booking API
      if (results.authentication) {
        console.log('\n4️⃣ Testing Booking API...');
        const bookingTest = await testBookingAPI();
        results.booking = bookingTest.success;
        if (!bookingTest.success) {
          results.errors.push(...bookingTest.errors);
        }
        console.log(bookingTest.success ? '✅ Booking API OK' : '❌ Booking API Issues');
      }
    }

    // Summary
    console.log('\n📊 Development Environment Test Summary:');
    console.log('Environment Config:', results.environment ? '✅' : '❌');
    console.log('Backend Health:', results.backend ? '✅' : '❌');
    console.log('Authentication:', results.authentication ? '✅' : '❌');
    console.log('Booking API:', results.booking ? '✅' : '❌');

    if (results.errors.length > 0) {
      console.log('\n🚨 Issues Found:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    const allPassed = results.environment && results.backend && results.authentication && results.booking;
    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    return results;

  } catch (error) {
    console.error('❌ Development test failed:', error);
    results.errors.push(`Test execution error: ${error.message}`);
    return results;
  }
}

/**
 * Test environment configuration
 */
function testEnvironmentConfig() {
  const errors = [];
  
  // Check required environment variables
  const requiredEnvs = [
    'VITE_API_URL',
    'VITE_APP_NAME',
    'VITE_NODE_ENV'
  ];

  requiredEnvs.forEach(env => {
    if (!import.meta.env[env]) {
      errors.push(`Missing environment variable: ${env}`);
    }
  });

  // Check API URL format
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && !apiUrl.startsWith('http')) {
    errors.push(`Invalid API URL format: ${apiUrl}`);
  }

  // Check development mode
  const isDev = import.meta.env.DEV;
  if (!isDev) {
    errors.push('Not running in development mode');
  }

  console.log('📡 API URL:', apiUrl);
  console.log('🌍 Environment:', import.meta.env.VITE_NODE_ENV);
  console.log('🔧 Development Mode:', isDev);

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Test backend health
 */
async function testBackendHealth() {
  const errors = [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/test/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      errors.push(`Backend health check failed: ${response.status} ${response.statusText}`);
    } else {
      const data = await response.json();
      console.log('🏥 Backend Health:', data.status);
      console.log('🗄️ Database:', data.database);
      console.log('⏱️ Uptime:', data.uptime, 'seconds');
    }

  } catch (error) {
    errors.push(`Backend connection failed: ${error.message}`);
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Test authentication flow
 */
async function testAuthenticationFlow() {
  const errors = [];
  
  try {
    // Test login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      errors.push(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
      return { success: false, errors };
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      errors.push(`Login failed: ${loginData.error}`);
      return { success: false, errors };
    }

    console.log('👤 User:', loginData.user.name);
    console.log('🎭 Role:', loginData.user.role);

    // Check token storage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      errors.push('Token not stored in localStorage');
    } else {
      console.log('🔑 Token stored successfully');
    }

    // Test profile endpoint
    const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.ok) {
      errors.push(`Profile fetch failed: ${profileResponse.status}`);
    } else {
      console.log('👤 Profile fetch successful');
    }

  } catch (error) {
    errors.push(`Authentication test failed: ${error.message}`);
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Test booking API
 */
async function testBookingAPI() {
  const errors = [];
  
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      errors.push('No authentication token available');
      return { success: false, errors };
    }

    // Test get bookings
    const bookingsResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!bookingsResponse.ok) {
      errors.push(`Get bookings failed: ${bookingsResponse.status}`);
    } else {
      const bookingsData = await bookingsResponse.json();
      console.log('📋 Bookings count:', bookingsData.data?.length || 0);
    }

    // Test get fields
    const fieldsResponse = await fetch(`${API_BASE_URL}/public/fields`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!fieldsResponse.ok) {
      errors.push(`Get fields failed: ${fieldsResponse.status}`);
    } else {
      const fieldsData = await fieldsResponse.json();
      console.log('🏟️ Fields count:', fieldsData.data?.length || 0);
    }

  } catch (error) {
    errors.push(`Booking API test failed: ${error.message}`);
  }

  return {
    success: errors.length === 0,
    errors
  };
}

// Make function available globally for console testing
if (typeof window !== 'undefined') {
  window.testDevelopmentEnvironment = testDevelopmentEnvironment;
}

export default testDevelopmentEnvironment;
