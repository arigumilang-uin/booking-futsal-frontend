// debug/frontend-production-integration-test.js
// Comprehensive Frontend-Production Backend Integration Test

console.log('🔍 Frontend-Production Integration Test Loaded');

/**
 * Comprehensive integration test for frontend with production backend
 */
async function verifyFrontendProductionIntegration() {
  console.log('🔍 Starting Comprehensive Frontend-Production Integration Test...\n');

  const results = {
    environment: {},
    connectivity: {},
    authentication: {},
    coreFeatures: {},
    errors: [],
    summary: {}
  };

  try {
    // Step 1: Environment Verification
    console.log('1️⃣ Verifying Environment Configuration...');
    results.environment = verifyEnvironmentConfig();
    
    // Step 2: Backend Connectivity Test
    console.log('\n2️⃣ Testing Backend Connectivity...');
    results.connectivity = await testBackendConnectivity();
    
    // Step 3: Authentication Flow Test
    console.log('\n3️⃣ Testing Authentication Flow...');
    results.authentication = await testAuthenticationFlow();
    
    // Step 4: Core Features Test
    console.log('\n4️⃣ Testing Core Features...');
    results.coreFeatures = await testCoreFeatures();
    
    // Step 5: Generate Summary
    console.log('\n📊 Generating Integration Test Summary...');
    results.summary = generateTestSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    results.errors.push(`Integration test error: ${error.message}`);
    return results;
  }
}

/**
 * Verify environment configuration
 */
function verifyEnvironmentConfig() {
  console.log('🔧 Checking Environment Variables...');
  
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
    VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE
  };

  console.log('📋 Environment Variables:');
  Object.entries(env).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  const apiUrl = env.VITE_API_URL;
  const isProductionBackend = apiUrl && apiUrl.includes('booking-futsal-production.up.railway.app');
  const isDevelopmentMode = env.DEV;

  console.log(`📡 API Target: ${apiUrl}`);
  console.log(`🏭 Using Production Backend: ${isProductionBackend}`);
  console.log(`🔧 Development Mode: ${isDevelopmentMode}`);

  return {
    success: true,
    apiUrl,
    isProductionBackend,
    isDevelopmentMode,
    mode: env.MODE,
    debugMode: env.VITE_DEBUG_MODE
  };
}

/**
 * Test backend connectivity
 */
async function testBackendConnectivity() {
  console.log('🌐 Testing Backend Connectivity...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const healthUrl = `${apiUrl}/test/health`;
  
  console.log(`🏥 Testing: ${healthUrl}`);

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend Health Check Passed');
      console.log(`   Status: ${data.status}`);
      console.log(`   Environment: ${data.environment}`);
      console.log(`   Database: ${data.database}`);
      console.log(`   Uptime: ${data.uptime} seconds`);
      
      return {
        success: true,
        status: data.status,
        environment: data.environment,
        database: data.database,
        uptime: data.uptime,
        responseTime: Date.now()
      };
    } else {
      console.log(`❌ Backend Health Check Failed: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }

  } catch (error) {
    console.log(`❌ Backend Connection Failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      type: 'connection_error'
    };
  }
}

/**
 * Test authentication flow with all user roles
 */
async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...');

  const testAccounts = [
    { email: 'ari@gmail.com', password: 'password123', role: 'customer', expectedRole: 'penyewa' },
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'kasir', expectedRole: 'staff_kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manager', expectedRole: 'manajer_futsal' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor', expectedRole: 'supervisor_sistem' }
  ];

  const results = [];
  const apiUrl = import.meta.env.VITE_API_URL;

  for (const account of testAccounts) {
    try {
      console.log(`🔐 Testing ${account.role}: ${account.email}`);
      
      // Clear previous auth
      localStorage.removeItem('auth_token');
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: account.email,
          password: account.password
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`   ✅ Login Success: ${data.user.name} (${data.user.role})`);
        
        // Check token storage
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          console.log(`   🔑 Token stored in localStorage`);
        }

        // Test authenticated request
        const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          credentials: 'include'
        });

        const profileSuccess = profileResponse.ok;
        console.log(`   👤 Profile fetch: ${profileSuccess ? 'SUCCESS' : 'FAILED'}`);

        results.push({
          ...account,
          success: true,
          user: data.user,
          tokenStored: !!localStorage.getItem('auth_token'),
          profileFetch: profileSuccess
        });

      } else {
        console.log(`   ❌ Login Failed: ${data.error || 'Unknown error'}`);
        results.push({
          ...account,
          success: false,
          error: data.error || 'Login failed'
        });
      }

    } catch (error) {
      console.error(`   ❌ ${account.role} test failed:`, error.message);
      results.push({
        ...account,
        success: false,
        error: error.message
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Authentication Summary: ${successCount}/${results.length} accounts successful`);

  return {
    success: successCount === results.length,
    results,
    successCount,
    totalCount: results.length
  };
}

/**
 * Test core features
 */
async function testCoreFeatures() {
  console.log('🏗️ Testing Core Features...');

  const apiUrl = import.meta.env.VITE_API_URL;
  const features = {
    fields: false,
    bookings: false,
    routes: false
  };

  try {
    // Test 1: Get Fields
    console.log('🏟️ Testing Get Fields...');
    const fieldsResponse = await fetch(`${apiUrl}/public/fields`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (fieldsResponse.ok) {
      const fieldsData = await fieldsResponse.json();
      features.fields = fieldsData.success && fieldsData.data && fieldsData.data.length > 0;
      console.log(`   Fields available: ${fieldsData.data?.length || 0}`);
    }

    // Test 2: Get Customer Bookings (with auth)
    console.log('📋 Testing Get Customer Bookings...');
    const token = localStorage.getItem('auth_token');
    if (token) {
      const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        features.bookings = bookingsData.success;
        console.log(`   Bookings available: ${bookingsData.data?.length || 0}`);
      }
    }

    // Test 3: Get Routes
    console.log('🛣️ Testing Get Routes...');
    const routesResponse = await fetch(`${apiUrl}/test/routes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (routesResponse.ok) {
      const routesData = await routesResponse.json();
      features.routes = routesData.success;
      console.log(`   Routes available: ${routesData.data?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Core features test failed:', error);
  }

  const successCount = Object.values(features).filter(Boolean).length;
  console.log(`📊 Core Features: ${successCount}/${Object.keys(features).length} working`);

  return {
    success: successCount === Object.keys(features).length,
    features,
    successCount,
    totalCount: Object.keys(features).length
  };
}

/**
 * Generate test summary
 */
function generateTestSummary(results) {
  console.log('\n📊 COMPREHENSIVE INTEGRATION TEST SUMMARY');
  console.log('='.repeat(60));
  
  // Environment Status
  console.log('\n🔧 ENVIRONMENT STATUS:');
  console.log(`   API URL: ${results.environment.apiUrl}`);
  console.log(`   Production Backend: ${results.environment.isProductionBackend ? '✅' : '❌'}`);
  console.log(`   Development Mode: ${results.environment.isDevelopmentMode ? '✅' : '❌'}`);
  
  // Connectivity Status
  console.log('\n🌐 BACKEND CONNECTIVITY:');
  if (results.connectivity.success) {
    console.log('   ✅ Backend: Connected');
    console.log(`   Status: ${results.connectivity.status}`);
    console.log(`   Database: ${results.connectivity.database}`);
    console.log(`   Environment: ${results.connectivity.environment}`);
  } else {
    console.log('   ❌ Backend: Connection Failed');
    console.log(`   Error: ${results.connectivity.error}`);
  }
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION STATUS:');
  if (results.authentication.success) {
    console.log(`   ✅ Authentication: ${results.authentication.successCount}/${results.authentication.totalCount} accounts working`);
    results.authentication.results.forEach(r => {
      console.log(`   ${r.success ? '✅' : '❌'} ${r.role}: ${r.email}`);
    });
  } else {
    console.log(`   ❌ Authentication: ${results.authentication.successCount}/${results.authentication.totalCount} accounts working`);
  }
  
  // Core Features Status
  console.log('\n🏗️ CORE FEATURES STATUS:');
  if (results.coreFeatures.success) {
    console.log(`   ✅ Core Features: ${results.coreFeatures.successCount}/${results.coreFeatures.totalCount} working`);
  } else {
    console.log(`   ❌ Core Features: ${results.coreFeatures.successCount}/${results.coreFeatures.totalCount} working`);
  }
  
  Object.entries(results.coreFeatures.features).forEach(([feature, status]) => {
    console.log(`   ${status ? '✅' : '❌'} ${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
  });
  
  // Overall Status
  const overallSuccess = results.environment.isProductionBackend && 
                        results.connectivity.success && 
                        results.authentication.success && 
                        results.coreFeatures.success;
  
  console.log('\n🎯 OVERALL STATUS:');
  console.log(`   ${overallSuccess ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ SOME ISSUES DETECTED'}`);
  
  // Recommendations
  if (!overallSuccess) {
    console.log('\n💡 RECOMMENDATIONS:');
    if (!results.connectivity.success) {
      console.log('   🔧 Check backend connectivity and network issues');
    }
    if (!results.authentication.success) {
      console.log('   🔐 Review authentication implementation and credentials');
    }
    if (!results.coreFeatures.success) {
      console.log('   🏗️ Check API endpoints and data availability');
    }
  }

  return {
    overallSuccess,
    environment: results.environment.isProductionBackend,
    connectivity: results.connectivity.success,
    authentication: results.authentication.success,
    coreFeatures: results.coreFeatures.success,
    authSuccessRate: `${results.authentication.successCount}/${results.authentication.totalCount}`,
    featuresSuccessRate: `${results.coreFeatures.successCount}/${results.coreFeatures.totalCount}`
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.verifyFrontendProductionIntegration = verifyFrontendProductionIntegration;
}

export default verifyFrontendProductionIntegration;
