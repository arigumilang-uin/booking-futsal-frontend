// debug/frontend-login-debug.js
// Frontend Login Debugging Script

console.log('🔍 Frontend Login Debug Script Loaded');

/**
 * Debug frontend login implementation
 */
async function debugFrontendLogin() {
  console.log('🔍 Starting Frontend Login Debug...\n');

  const results = {
    environment: {},
    axiosConfig: {},
    apiTest: {},
    frontendFlow: {},
    errors: []
  };

  try {
    // Step 1: Environment Check
    console.log('1️⃣ Checking Environment Configuration...');
    results.environment = checkEnvironmentConfig();
    
    // Step 2: Axios Configuration Check
    console.log('\n2️⃣ Checking Axios Configuration...');
    results.axiosConfig = await checkAxiosConfig();
    
    // Step 3: Direct API Test
    console.log('\n3️⃣ Testing Direct API Call...');
    results.apiTest = await testDirectAPICall();
    
    // Step 4: Frontend Flow Test
    console.log('\n4️⃣ Testing Frontend Login Flow...');
    results.frontendFlow = await testFrontendLoginFlow();
    
    // Step 5: Generate Report
    console.log('\n📊 Generating Debug Report...');
    generateDebugReport(results);
    
    return results;

  } catch (error) {
    console.error('❌ Debug failed:', error);
    results.errors.push(`Debug error: ${error.message}`);
    return results;
  }
}

/**
 * Check environment configuration
 */
function checkEnvironmentConfig() {
  console.log('🔧 Environment Variables:');
  
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
    VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE,
    BASE_URL: import.meta.env.BASE_URL
  };

  Object.entries(env).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  const apiUrl = env.VITE_API_URL;
  console.log(`📡 Current API URL: ${apiUrl}`);

  return {
    apiUrl,
    isDevelopment: env.DEV,
    mode: env.MODE,
    debugMode: env.VITE_DEBUG_MODE
  };
}

/**
 * Check axios configuration
 */
async function checkAxiosConfig() {
  console.log('⚙️ Checking Axios Instance Configuration...');

  try {
    // Import axios instance
    const { default: axiosInstance } = await import('../src/api/axiosInstance.js');
    
    console.log('📋 Axios Config:');
    console.log(`   Base URL: ${axiosInstance.defaults.baseURL}`);
    console.log(`   Timeout: ${axiosInstance.defaults.timeout}ms`);
    console.log(`   With Credentials: ${axiosInstance.defaults.withCredentials}`);
    console.log(`   Headers:`, axiosInstance.defaults.headers);

    // Check interceptors
    console.log(`   Request Interceptors: ${axiosInstance.interceptors.request.handlers.length}`);
    console.log(`   Response Interceptors: ${axiosInstance.interceptors.response.handlers.length}`);

    return {
      success: true,
      baseURL: axiosInstance.defaults.baseURL,
      timeout: axiosInstance.defaults.timeout,
      withCredentials: axiosInstance.defaults.withCredentials,
      requestInterceptors: axiosInstance.interceptors.request.handlers.length,
      responseInterceptors: axiosInstance.interceptors.response.handlers.length
    };

  } catch (error) {
    console.error('❌ Axios config check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test direct API call using fetch
 */
async function testDirectAPICall() {
  console.log('🌐 Testing Direct Fetch API Call...');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://booking-futsal-production.up.railway.app/api';
  const loginUrl = `${apiUrl}/auth/login`;

  const testCredentials = [
    { email: 'ari@gmail.com', password: 'password123', role: 'customer' },
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor' }
  ];

  const results = [];

  for (const cred of testCredentials) {
    try {
      console.log(`🔐 Testing ${cred.role}: ${cred.email}`);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: cred.email,
          password: cred.password
        })
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log(`   Success: ${data.success}`);
      console.log(`   User: ${data.user?.name} (${data.user?.role})`);

      results.push({
        email: cred.email,
        role: cred.role,
        success: data.success,
        status: response.status,
        user: data.user,
        error: data.error
      });

    } catch (error) {
      console.error(`❌ ${cred.role} test failed:`, error.message);
      results.push({
        email: cred.email,
        role: cred.role,
        success: false,
        error: error.message
      });
    }
  }

  return {
    success: results.every(r => r.success),
    results
  };
}

/**
 * Test frontend login flow
 */
async function testFrontendLoginFlow() {
  console.log('🎯 Testing Frontend Login Flow...');

  try {
    // Import auth API
    const { loginUser } = await import('../src/api/authAPI.js');
    
    console.log('📤 Testing authAPI.loginUser()...');
    
    const testCredentials = {
      email: 'ari@gmail.com',
      password: 'password123'
    };

    console.log('🔐 Calling loginUser with:', testCredentials);
    
    const result = await loginUser(testCredentials);
    
    console.log('📥 LoginUser Result:', result);
    console.log(`   Success: ${result.success}`);
    console.log(`   User: ${result.user?.name}`);
    console.log(`   Message: ${result.message}`);

    // Check token storage
    const storedToken = localStorage.getItem('auth_token');
    console.log(`💾 Token stored: ${storedToken ? 'YES' : 'NO'}`);

    return {
      success: result.success,
      user: result.user,
      message: result.message,
      tokenStored: !!storedToken,
      error: result.error
    };

  } catch (error) {
    console.error('❌ Frontend login flow test failed:', error);
    
    // Check if it's an axios error
    if (error.response) {
      console.error('   Response Status:', error.response.status);
      console.error('   Response Data:', error.response.data);
      console.error('   Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   Request Error:', error.request);
    } else {
      console.error('   Error Message:', error.message);
    }

    return {
      success: false,
      error: error.message,
      axiosError: {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      }
    };
  }
}

/**
 * Generate debug report
 */
function generateDebugReport(results) {
  console.log('\n📊 FRONTEND LOGIN DEBUG REPORT');
  console.log('='.repeat(50));
  
  // Environment Status
  console.log('\n🔧 ENVIRONMENT STATUS:');
  console.log(`   API URL: ${results.environment.apiUrl}`);
  console.log(`   Mode: ${results.environment.mode}`);
  console.log(`   Development: ${results.environment.isDevelopment}`);
  
  // Axios Configuration
  console.log('\n⚙️ AXIOS CONFIGURATION:');
  if (results.axiosConfig.success) {
    console.log('   ✅ Axios Config: OK');
    console.log(`   Base URL: ${results.axiosConfig.baseURL}`);
    console.log(`   Timeout: ${results.axiosConfig.timeout}ms`);
    console.log(`   With Credentials: ${results.axiosConfig.withCredentials}`);
  } else {
    console.log('   ❌ Axios Config: Failed');
    console.log(`   Error: ${results.axiosConfig.error}`);
  }
  
  // Direct API Test
  console.log('\n🌐 DIRECT API TEST:');
  if (results.apiTest.success) {
    console.log('   ✅ Direct API: All accounts working');
    results.apiTest.results.forEach(r => {
      console.log(`   ${r.success ? '✅' : '❌'} ${r.role}: ${r.email}`);
    });
  } else {
    console.log('   ❌ Direct API: Some failures');
  }
  
  // Frontend Flow
  console.log('\n🎯 FRONTEND FLOW:');
  if (results.frontendFlow.success) {
    console.log('   ✅ Frontend Flow: Working');
    console.log(`   User: ${results.frontendFlow.user?.name}`);
    console.log(`   Token Stored: ${results.frontendFlow.tokenStored}`);
  } else {
    console.log('   ❌ Frontend Flow: Failed');
    console.log(`   Error: ${results.frontendFlow.error}`);
    
    if (results.frontendFlow.axiosError) {
      console.log(`   Axios Status: ${results.frontendFlow.axiosError.status}`);
      console.log(`   Axios Data:`, results.frontendFlow.axiosError.data);
    }
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!results.axiosConfig.success) {
    console.log('   🔧 Fix axios configuration issues');
  }
  
  if (!results.frontendFlow.success && results.apiTest.success) {
    console.log('   🎯 Issue is in frontend implementation, not backend');
    console.log('   🔍 Check axios interceptors and error handling');
  }
  
  if (results.frontendFlow.axiosError?.status === 0) {
    console.log('   🌐 Network connectivity issue or CORS problem');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Check browser Network tab during login');
  console.log('   2. Monitor browser console for errors');
  console.log('   3. Verify axios request is being sent correctly');
  console.log('   4. Check for CORS or network issues');
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.debugFrontendLogin = debugFrontendLogin;
}

export default debugFrontendLogin;
