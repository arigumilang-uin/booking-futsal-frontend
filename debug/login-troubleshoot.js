// debug/login-troubleshoot.js
// Login Troubleshooting Script untuk Development Environment

console.log('🔍 Starting Login Troubleshooting...\n');

/**
 * Test login functionality dengan berbagai skenario
 */
async function troubleshootLogin() {
  const results = {
    environment: {},
    backend: {},
    login: {},
    authentication: {},
    errors: []
  };

  try {
    // Step 1: Environment Check
    console.log('1️⃣ Checking Environment Configuration...');
    results.environment = checkEnvironment();
    
    // Step 2: Backend Connectivity
    console.log('\n2️⃣ Testing Backend Connectivity...');
    results.backend = await testBackendConnectivity();
    
    // Step 3: Login API Test
    console.log('\n3️⃣ Testing Login API...');
    results.login = await testLoginAPI();
    
    // Step 4: Authentication Flow
    console.log('\n4️⃣ Testing Authentication Flow...');
    results.authentication = await testAuthenticationFlow();
    
    // Step 5: Generate Report
    console.log('\n📊 Generating Troubleshooting Report...');
    generateTroubleshootingReport(results);
    
    return results;

  } catch (error) {
    console.error('❌ Troubleshooting failed:', error);
    results.errors.push(`Troubleshooting error: ${error.message}`);
    return results;
  }
}

/**
 * Check environment configuration
 */
function checkEnvironment() {
  console.log('🔧 Environment Variables:');
  
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
    VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE
  };

  Object.entries(env).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  const apiUrl = env.VITE_API_URL || 'http://localhost:3000/api';
  const isLocalhost = apiUrl.includes('localhost');
  
  console.log(`📡 API Target: ${apiUrl}`);
  console.log(`🏠 Using Localhost: ${isLocalhost}`);
  console.log(`🔧 Development Mode: ${env.DEV}`);

  return {
    apiUrl,
    isLocalhost,
    isDevelopment: env.DEV,
    mode: env.MODE,
    debugMode: env.VITE_DEBUG_MODE
  };
}

/**
 * Test backend connectivity
 */
async function testBackendConnectivity() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const healthUrl = `${apiUrl}/test/health`;
  
  console.log(`🏥 Testing: ${healthUrl}`);

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
        uptime: data.uptime
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
 * Test login API
 */
async function testLoginAPI() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const loginUrl = `${apiUrl}/auth/login`;
  
  console.log(`🔐 Testing Login: ${loginUrl}`);

  const credentials = {
    email: 'ari@gmail.com',
    password: 'password123'
  };

  try {
    console.log('📤 Sending login request...');
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(credentials)
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    
    // Log response headers
    console.log('📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().includes('set-cookie') || key.toLowerCase().includes('authorization')) {
        console.log(`   ${key}: ${value}`);
      }
    }

    const data = await response.json();
    console.log('📄 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Login API Test Passed');
      
      // Check for token in response
      const hasToken = !!data.token;
      console.log(`🔑 Token in Response: ${hasToken ? 'YES' : 'NO'}`);
      
      if (hasToken) {
        console.log('🔑 Token Length:', data.token.length);
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        hasToken,
        message: data.message
      };
    } else {
      console.log('❌ Login API Test Failed');
      return {
        success: false,
        error: data.error || 'Login failed',
        status: response.status,
        data
      };
    }

  } catch (error) {
    console.log(`❌ Login API Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      type: 'network_error'
    };
  }
}

/**
 * Test authentication flow
 */
async function testAuthenticationFlow() {
  console.log('🔐 Testing Complete Authentication Flow...');

  try {
    // Clear existing auth data
    localStorage.removeItem('auth_token');
    console.log('🧹 Cleared existing auth data');

    // Test login
    const loginResult = await testLoginAPI();
    
    if (!loginResult.success) {
      return {
        success: false,
        error: 'Login failed in authentication flow',
        loginResult
      };
    }

    // Check token storage
    const storedToken = localStorage.getItem('auth_token');
    console.log(`💾 Token Stored: ${storedToken ? 'YES' : 'NO'}`);
    
    if (storedToken) {
      console.log('🔑 Stored Token Length:', storedToken.length);
    }

    // Test authenticated request
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const profileUrl = `${apiUrl}/auth/profile`;
    
    console.log('👤 Testing Profile Request...');
    const profileResponse = await fetch(profileUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': storedToken ? `Bearer ${storedToken}` : ''
      },
      credentials: 'include'
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile Request Successful');
      console.log('👤 User Profile:', profileData.user?.name);
      
      return {
        success: true,
        tokenStored: !!storedToken,
        profileFetch: true,
        user: profileData.user
      };
    } else {
      console.log(`❌ Profile Request Failed: ${profileResponse.status}`);
      return {
        success: false,
        tokenStored: !!storedToken,
        profileFetch: false,
        error: `Profile fetch failed: ${profileResponse.status}`
      };
    }

  } catch (error) {
    console.log(`❌ Authentication Flow Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      type: 'auth_flow_error'
    };
  }
}

/**
 * Generate troubleshooting report
 */
function generateTroubleshootingReport(results) {
  console.log('\n📊 TROUBLESHOOTING REPORT');
  console.log('='.repeat(50));
  
  // Environment Status
  console.log('\n🔧 ENVIRONMENT STATUS:');
  console.log(`   API URL: ${results.environment.apiUrl}`);
  console.log(`   Mode: ${results.environment.mode}`);
  console.log(`   Development: ${results.environment.isDevelopment}`);
  console.log(`   Using Localhost: ${results.environment.isLocalhost}`);
  
  // Backend Status
  console.log('\n🏥 BACKEND STATUS:');
  if (results.backend.success) {
    console.log('   ✅ Backend: Connected');
    console.log(`   Status: ${results.backend.status}`);
    console.log(`   Environment: ${results.backend.environment}`);
    console.log(`   Database: ${results.backend.database}`);
  } else {
    console.log('   ❌ Backend: Not Connected');
    console.log(`   Error: ${results.backend.error}`);
  }
  
  // Login Status
  console.log('\n🔐 LOGIN STATUS:');
  if (results.login.success) {
    console.log('   ✅ Login API: Working');
    console.log(`   User: ${results.login.user?.name}`);
    console.log(`   Role: ${results.login.user?.role}`);
    console.log(`   Token: ${results.login.hasToken ? 'Present' : 'Missing'}`);
  } else {
    console.log('   ❌ Login API: Failed');
    console.log(`   Error: ${results.login.error}`);
  }
  
  // Authentication Status
  console.log('\n🔑 AUTHENTICATION STATUS:');
  if (results.authentication.success) {
    console.log('   ✅ Auth Flow: Complete');
    console.log(`   Token Storage: ${results.authentication.tokenStored ? 'Working' : 'Failed'}`);
    console.log(`   Profile Fetch: ${results.authentication.profileFetch ? 'Working' : 'Failed'}`);
  } else {
    console.log('   ❌ Auth Flow: Failed');
    console.log(`   Error: ${results.authentication.error}`);
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!results.backend.success) {
    if (results.environment.isLocalhost) {
      console.log('   🚨 Start backend development server:');
      console.log('      cd ../booking_futsal && npm run dev');
    } else {
      console.log('   🌐 Using production backend - check network connectivity');
    }
  }
  
  if (!results.login.success && results.backend.success) {
    console.log('   🔐 Check login credentials and backend auth configuration');
  }
  
  if (!results.authentication.tokenStored) {
    console.log('   💾 Check token storage implementation in authAPI.js');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Fix backend connectivity issues');
  console.log('   2. Test login in browser UI');
  console.log('   3. Monitor browser console for errors');
  console.log('   4. Check network tab for API requests');
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.troubleshootLogin = troubleshootLogin;
}

// Auto-run if in development
if (import.meta.env.DEV) {
  console.log('🔧 Login troubleshooting script loaded!');
  console.log('Run: troubleshootLogin() to start troubleshooting');
}

export default troubleshootLogin;
