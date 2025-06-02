// debug/production-backend-dev-frontend-test.js
// Test Production Backend + Development Frontend Setup

console.log('🚀 Production Backend + Development Frontend Test Loaded');

/**
 * Test setup dengan backend production dan frontend development
 */
async function testProductionBackendDevFrontend() {
  console.log('🚀 TESTING PRODUCTION BACKEND + DEVELOPMENT FRONTEND SETUP...\n');

  const results = {
    setup: {},
    backendProduction: {},
    frontendDevelopment: {},
    crossOriginIntegration: {},
    endpointPerformance: {},
    authenticationFlow: {},
    dataFlow: {},
    optimization: {},
    summary: {}
  };

  try {
    // Step 1: Verify Setup Configuration
    console.log('1️⃣ Verifying Setup Configuration...');
    results.setup = verifySetupConfiguration();
    
    // Step 2: Test Production Backend
    console.log('\n2️⃣ Testing Production Backend...');
    results.backendProduction = await testProductionBackend();
    
    // Step 3: Test Development Frontend
    console.log('\n3️⃣ Testing Development Frontend...');
    results.frontendDevelopment = await testDevelopmentFrontend();
    
    // Step 4: Test Cross-Origin Integration
    console.log('\n4️⃣ Testing Cross-Origin Integration...');
    results.crossOriginIntegration = await testCrossOriginIntegration();
    
    // Step 5: Test Endpoint Performance
    console.log('\n5️⃣ Testing Endpoint Performance...');
    results.endpointPerformance = await testEndpointPerformance();
    
    // Step 6: Test Authentication Flow
    console.log('\n6️⃣ Testing Authentication Flow...');
    results.authenticationFlow = await testAuthenticationFlow();
    
    // Step 7: Test Data Flow
    console.log('\n7️⃣ Testing Data Flow...');
    results.dataFlow = await testDataFlow();
    
    // Step 8: Generate Optimization Recommendations
    console.log('\n8️⃣ Generating Optimization Recommendations...');
    results.optimization = generateOptimizationRecommendations(results);
    
    // Step 9: Generate Summary
    console.log('\n9️⃣ Generating Setup Summary...');
    results.summary = generateSetupSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Production backend + dev frontend test failed:', error);
    return { error: error.message };
  }
}

/**
 * Verify setup configuration
 */
function verifySetupConfiguration() {
  console.log('⚙️ Verifying setup configuration...');
  
  const setup = {
    frontendMode: 'development',
    backendMode: 'production',
    apiUrl: import.meta.env.VITE_API_URL,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    corsEnabled: import.meta.env.VITE_CORS_ENABLED === 'true',
    credentialsInclude: import.meta.env.VITE_CREDENTIALS_INCLUDE === 'true',
    frontendPort: window.location.port || '5173',
    backendUrl: null,
    configurationValid: false
  };

  // Extract backend URL
  if (setup.apiUrl) {
    setup.backendUrl = setup.apiUrl.replace('/api', '');
    setup.configurationValid = setup.apiUrl.includes('railway.app');
  }

  console.log(`   🌐 Frontend Mode: ${setup.frontendMode}`);
  console.log(`   🏭 Backend Mode: ${setup.backendMode}`);
  console.log(`   🎯 API URL: ${setup.apiUrl}`);
  console.log(`   🔧 Debug Mode: ${setup.debugMode ? 'Enabled' : 'Disabled'}`);
  console.log(`   🔗 CORS: ${setup.corsEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`   🍪 Credentials: ${setup.credentialsInclude ? 'Include' : 'Exclude'}`);
  console.log(`   📍 Frontend Port: ${setup.frontendPort}`);
  console.log(`   ${setup.configurationValid ? '✅' : '❌'} Configuration: ${setup.configurationValid ? 'Valid' : 'Invalid'}`);

  return setup;
}

/**
 * Test production backend
 */
async function testProductionBackend() {
  console.log('🏭 Testing production backend...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const backend = {
    accessible: false,
    healthy: false,
    database: false,
    environment: null,
    responseTime: 0,
    endpointsWorking: 0,
    totalEndpoints: 0
  };

  try {
    const startTime = performance.now();
    
    // Test backend health
    const healthResponse = await fetch(`${apiUrl}/test/health`);
    const endTime = performance.now();
    backend.responseTime = Math.round(endTime - startTime);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      backend.accessible = true;
      backend.healthy = healthData.status === 'OK';
      backend.database = healthData.database === 'Connected';
      backend.environment = healthData.environment;
      
      console.log(`   ${backend.accessible ? '✅' : '❌'} Accessible: ${backend.accessible}`);
      console.log(`   ${backend.healthy ? '✅' : '❌'} Health: ${healthData.status}`);
      console.log(`   ${backend.database ? '✅' : '❌'} Database: ${healthData.database}`);
      console.log(`   🌍 Environment: ${healthData.environment}`);
      console.log(`   ⚡ Response Time: ${backend.responseTime}ms`);
    }

    // Test endpoints availability
    const endpoints = [
      '/staff/manager/bookings',
      '/staff/kasir/bookings',
      '/staff/operator/bookings',
      '/admin/bookings',
      '/admin/bookings/statistics'
    ];

    backend.totalEndpoints = endpoints.length;
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${apiUrl}${endpoint}`);
        if (response.ok) {
          backend.endpointsWorking++;
        }
      } catch (error) {
        // Endpoint not working
      }
    }

    console.log(`   📊 Working Endpoints: ${backend.endpointsWorking}/${backend.totalEndpoints}`);

  } catch (error) {
    console.log(`   ❌ Backend test error: ${error.message}`);
    backend.error = error.message;
  }

  return backend;
}

/**
 * Test development frontend
 */
async function testDevelopmentFrontend() {
  console.log('🌐 Testing development frontend...');
  
  const frontend = {
    running: false,
    port: window.location.port || '5173',
    protocol: window.location.protocol,
    host: window.location.hostname,
    reactMounted: false,
    viteRunning: false,
    hotReloadWorking: false,
    environmentLoaded: false
  };

  try {
    // Check if frontend is running
    frontend.running = window.location.hostname === 'localhost' && frontend.port === '5173';
    console.log(`   ${frontend.running ? '✅' : '❌'} Running: ${frontend.running} (${frontend.protocol}//${frontend.host}:${frontend.port})`);
    
    // Check if React is mounted
    const rootElement = document.getElementById('root');
    frontend.reactMounted = rootElement && rootElement.children.length > 0;
    console.log(`   ${frontend.reactMounted ? '✅' : '❌'} React Mounted: ${frontend.reactMounted}`);
    
    // Check if Vite is running (development mode indicators)
    frontend.viteRunning = window.__vite_plugin_react_preamble_installed__ !== undefined || 
                          document.querySelector('script[type="module"][src*="/@vite/"]') !== null;
    console.log(`   ${frontend.viteRunning ? '✅' : '❌'} Vite Running: ${frontend.viteRunning}`);
    
    // Check environment variables
    frontend.environmentLoaded = !!import.meta.env.VITE_API_URL;
    console.log(`   ${frontend.environmentLoaded ? '✅' : '❌'} Environment Loaded: ${frontend.environmentLoaded}`);
    
    // Check hot reload (development feature)
    frontend.hotReloadWorking = import.meta.hot !== undefined;
    console.log(`   ${frontend.hotReloadWorking ? '✅' : '❌'} Hot Reload: ${frontend.hotReloadWorking ? 'Available' : 'Not available'}`);

  } catch (error) {
    console.log(`   ❌ Frontend test error: ${error.message}`);
    frontend.error = error.message;
  }

  return frontend;
}

/**
 * Test cross-origin integration
 */
async function testCrossOriginIntegration() {
  console.log('🔗 Testing cross-origin integration...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const integration = {
    corsWorking: false,
    credentialsWorking: false,
    preflight: false,
    responseHeaders: {},
    requestHeaders: {},
    crossOriginCookies: false
  };

  try {
    // Test basic CORS
    const corsResponse = await fetch(`${apiUrl}/test/health`, {
      method: 'GET',
      credentials: 'include'
    });
    
    integration.corsWorking = corsResponse.ok;
    console.log(`   ${integration.corsWorking ? '✅' : '❌'} CORS Working: ${integration.corsWorking}`);
    
    // Check response headers
    integration.responseHeaders = {
      'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': corsResponse.headers.get('access-control-allow-credentials'),
      'access-control-allow-methods': corsResponse.headers.get('access-control-allow-methods')
    };
    
    console.log(`   🔍 CORS Headers:`, integration.responseHeaders);
    
    // Test credentials (cookies)
    integration.credentialsWorking = corsResponse.headers.get('access-control-allow-credentials') === 'true';
    console.log(`   ${integration.credentialsWorking ? '✅' : '❌'} Credentials: ${integration.credentialsWorking ? 'Allowed' : 'Not allowed'}`);
    
    // Test preflight for complex requests
    try {
      const preflightResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'OPTIONS'
      });
      integration.preflight = preflightResponse.ok;
      console.log(`   ${integration.preflight ? '✅' : '❌'} Preflight: ${integration.preflight ? 'Working' : 'Issues'}`);
    } catch (error) {
      console.log(`   ⚠️ Preflight: Cannot test (${error.message})`);
    }

  } catch (error) {
    console.log(`   ❌ Integration test error: ${error.message}`);
    integration.error = error.message;
  }

  return integration;
}

/**
 * Test endpoint performance
 */
async function testEndpointPerformance() {
  console.log('⚡ Testing endpoint performance...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const performance = {
    averageResponseTime: 0,
    fastestEndpoint: null,
    slowestEndpoint: null,
    endpointTimes: {},
    performanceGrade: 'Unknown'
  };

  const endpoints = [
    '/test/health',
    '/staff/manager/bookings',
    '/admin/bookings',
    '/admin/bookings/statistics'
  ];

  const times = [];

  for (const endpoint of endpoints) {
    try {
      const startTime = performance.now();
      const response = await fetch(`${apiUrl}${endpoint}`);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      performance.endpointTimes[endpoint] = {
        time: responseTime,
        status: response.status,
        working: response.ok
      };
      
      if (response.ok) {
        times.push(responseTime);
      }
      
      console.log(`   ${response.ok ? '✅' : '❌'} ${endpoint}: ${responseTime}ms (HTTP ${response.status})`);
      
    } catch (error) {
      performance.endpointTimes[endpoint] = {
        time: null,
        status: 'ERROR',
        working: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint}: Error - ${error.message}`);
    }
  }

  if (times.length > 0) {
    performance.averageResponseTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    performance.fastestEndpoint = Math.min(...times);
    performance.slowestEndpoint = Math.max(...times);
    
    // Performance grading
    if (performance.averageResponseTime < 200) {
      performance.performanceGrade = 'Excellent';
    } else if (performance.averageResponseTime < 500) {
      performance.performanceGrade = 'Good';
    } else if (performance.averageResponseTime < 1000) {
      performance.performanceGrade = 'Fair';
    } else {
      performance.performanceGrade = 'Poor';
    }
    
    console.log(`   📊 Average Response Time: ${performance.averageResponseTime}ms`);
    console.log(`   ⚡ Fastest: ${performance.fastestEndpoint}ms`);
    console.log(`   🐌 Slowest: ${performance.slowestEndpoint}ms`);
    console.log(`   🎯 Performance Grade: ${performance.performanceGrade}`);
  }

  return performance;
}

/**
 * Test authentication flow
 */
async function testAuthenticationFlow() {
  console.log('🔐 Testing authentication flow...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const auth = {
    loginWorking: false,
    sessionPersistence: false,
    crossOriginAuth: false,
    tokenHandling: false,
    roleBasedAccess: false
  };

  try {
    // Test login
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'manajer1@futsalapp.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      auth.loginWorking = loginData.success;
      auth.tokenHandling = !!loginData.token;
      auth.crossOriginAuth = loginResponse.headers.get('set-cookie') !== null || loginData.token;
      
      console.log(`   ${auth.loginWorking ? '✅' : '❌'} Login Working: ${auth.loginWorking}`);
      console.log(`   ${auth.tokenHandling ? '✅' : '❌'} Token Handling: ${auth.tokenHandling}`);
      console.log(`   ${auth.crossOriginAuth ? '✅' : '❌'} Cross-Origin Auth: ${auth.crossOriginAuth}`);
      
      // Test session persistence
      const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
        credentials: 'include'
      });
      auth.sessionPersistence = profileResponse.ok;
      console.log(`   ${auth.sessionPersistence ? '✅' : '❌'} Session Persistence: ${auth.sessionPersistence}`);
      
      // Test role-based access
      const adminResponse = await fetch(`${apiUrl}/admin/bookings`, {
        credentials: 'include'
      });
      auth.roleBasedAccess = adminResponse.ok;
      console.log(`   ${auth.roleBasedAccess ? '✅' : '❌'} Role-based Access: ${auth.roleBasedAccess}`);
    }

  } catch (error) {
    console.log(`   ❌ Authentication test error: ${error.message}`);
    auth.error = error.message;
  }

  return auth;
}

/**
 * Test data flow
 */
async function testDataFlow() {
  console.log('📊 Testing data flow...');
  
  const dataFlow = {
    frontendAPIWorking: false,
    dataRetrieval: false,
    roleBasedData: false,
    dataCount: 0,
    endpointUsed: null,
    responseTime: 0
  };

  try {
    // Test frontend API
    const { getAllBookings } = await import('../src/api/bookingAPI.js');
    
    // Set manager role
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Test Manager',
      role: 'manajer_futsal'
    }));

    const startTime = performance.now();
    const result = await getAllBookings({ page: 1, limit: 10 });
    const endTime = performance.now();
    dataFlow.responseTime = Math.round(endTime - startTime);
    
    dataFlow.frontendAPIWorking = result.success;
    dataFlow.dataRetrieval = result.data && Array.isArray(result.data);
    dataFlow.dataCount = result.data?.length || 0;
    dataFlow.endpointUsed = result._metadata?.endpoint_used;
    dataFlow.roleBasedData = dataFlow.endpointUsed?.includes('/admin/') || dataFlow.endpointUsed?.includes('/staff/');
    
    console.log(`   ${dataFlow.frontendAPIWorking ? '✅' : '❌'} Frontend API Working: ${dataFlow.frontendAPIWorking}`);
    console.log(`   ${dataFlow.dataRetrieval ? '✅' : '❌'} Data Retrieval: ${dataFlow.dataRetrieval}`);
    console.log(`   📊 Data Count: ${dataFlow.dataCount}`);
    console.log(`   🎯 Endpoint Used: ${dataFlow.endpointUsed}`);
    console.log(`   ${dataFlow.roleBasedData ? '✅' : '❌'} Role-based Data: ${dataFlow.roleBasedData}`);
    console.log(`   ⚡ Response Time: ${dataFlow.responseTime}ms`);

  } catch (error) {
    console.log(`   ❌ Data flow test error: ${error.message}`);
    dataFlow.error = error.message;
  }

  return dataFlow;
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(results) {
  console.log('🔧 Generating optimization recommendations...');
  
  const recommendations = [];
  
  // Performance optimizations
  if (results.endpointPerformance?.averageResponseTime > 500) {
    recommendations.push({
      type: 'Performance',
      priority: 'High',
      issue: 'Slow API response times',
      solution: 'Consider implementing request caching or API optimization'
    });
  }
  
  // CORS optimizations
  if (!results.crossOriginIntegration?.credentialsWorking) {
    recommendations.push({
      type: 'Security',
      priority: 'Medium',
      issue: 'Credentials not working across origins',
      solution: 'Verify CORS credentials configuration on production backend'
    });
  }
  
  // Development optimizations
  if (!results.frontendDevelopment?.hotReloadWorking) {
    recommendations.push({
      type: 'Development',
      priority: 'Low',
      issue: 'Hot reload not available',
      solution: 'Ensure Vite development server is properly configured'
    });
  }
  
  // Data flow optimizations
  if (results.dataFlow?.dataCount === 0) {
    recommendations.push({
      type: 'Data',
      priority: 'High',
      issue: 'No data returned from API',
      solution: 'Check backend data availability and endpoint permissions'
    });
  }

  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. [${rec.priority}] ${rec.type}: ${rec.issue}`);
    console.log(`      💡 Solution: ${rec.solution}`);
  });

  return recommendations;
}

/**
 * Generate setup summary
 */
function generateSetupSummary(results) {
  console.log('\n🚀 PRODUCTION BACKEND + DEVELOPMENT FRONTEND SETUP SUMMARY');
  console.log('='.repeat(80));
  
  // Setup Configuration
  console.log('\n⚙️ SETUP CONFIGURATION:');
  const setup = results.setup;
  console.log(`   Frontend: ${setup.frontendMode} (Port ${setup.frontendPort})`);
  console.log(`   Backend: ${setup.backendMode} (${setup.backendUrl})`);
  console.log(`   Configuration: ${setup.configurationValid ? '✅ Valid' : '❌ Invalid'}`);
  
  // Backend Status
  console.log('\n🏭 PRODUCTION BACKEND:');
  const backend = results.backendProduction;
  console.log(`   Health: ${backend.healthy ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`   Database: ${backend.database ? '✅ Connected' : '❌ Issues'}`);
  console.log(`   Endpoints: ${backend.endpointsWorking}/${backend.totalEndpoints} working`);
  console.log(`   Response Time: ${backend.responseTime}ms`);
  
  // Frontend Status
  console.log('\n🌐 DEVELOPMENT FRONTEND:');
  const frontend = results.frontendDevelopment;
  console.log(`   Running: ${frontend.running ? '✅ Yes' : '❌ No'}`);
  console.log(`   React: ${frontend.reactMounted ? '✅ Mounted' : '❌ Not mounted'}`);
  console.log(`   Vite: ${frontend.viteRunning ? '✅ Running' : '❌ Not running'}`);
  console.log(`   Hot Reload: ${frontend.hotReloadWorking ? '✅ Available' : '❌ Not available'}`);
  
  // Integration Status
  console.log('\n🔗 CROSS-ORIGIN INTEGRATION:');
  const integration = results.crossOriginIntegration;
  console.log(`   CORS: ${integration.corsWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Credentials: ${integration.credentialsWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Preflight: ${integration.preflight ? '✅ Working' : '❌ Issues'}`);
  
  // Performance Status
  console.log('\n⚡ PERFORMANCE:');
  const performance = results.endpointPerformance;
  console.log(`   Average Response: ${performance.averageResponseTime}ms`);
  console.log(`   Performance Grade: ${performance.performanceGrade}`);
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION:');
  const auth = results.authenticationFlow;
  console.log(`   Login: ${auth.loginWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Session: ${auth.sessionPersistence ? '✅ Persistent' : '❌ Issues'}`);
  console.log(`   Cross-Origin Auth: ${auth.crossOriginAuth ? '✅ Working' : '❌ Issues'}`);
  
  // Data Flow Status
  console.log('\n📊 DATA FLOW:');
  const dataFlow = results.dataFlow;
  console.log(`   Frontend API: ${dataFlow.frontendAPIWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Data Retrieval: ${dataFlow.dataRetrieval ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Data Count: ${dataFlow.dataCount} items`);
  console.log(`   Endpoint Used: ${dataFlow.endpointUsed || 'None'}`);
  
  // Overall Status
  console.log('\n🎯 OVERALL STATUS:');
  const overallWorking = 
    setup.configurationValid &&
    backend.healthy &&
    frontend.running &&
    integration.corsWorking &&
    auth.loginWorking &&
    dataFlow.frontendAPIWorking;
  
  if (overallWorking) {
    console.log('   🎉 SETUP FULLY FUNCTIONAL!');
    console.log('   ✅ Production backend healthy and accessible');
    console.log('   ✅ Development frontend running with hot reload');
    console.log('   ✅ Cross-origin integration working');
    console.log('   ✅ Authentication flow working');
    console.log('   ✅ Data flow working');
    console.log('   🚀 READY FOR DEVELOPMENT AND TESTING!');
  } else {
    console.log('   ⚠️ SETUP HAS ISSUES - CHECK RECOMMENDATIONS');
  }

  return {
    configurationValid: setup.configurationValid,
    backendWorking: backend.healthy && backend.database,
    frontendWorking: frontend.running && frontend.reactMounted,
    integrationWorking: integration.corsWorking,
    authWorking: auth.loginWorking,
    dataFlowWorking: dataFlow.frontendAPIWorking,
    overallWorking: overallWorking,
    recommendations: results.optimization?.length || 0
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testProductionBackendDevFrontend = testProductionBackendDevFrontend;
}

export default testProductionBackendDevFrontend;
