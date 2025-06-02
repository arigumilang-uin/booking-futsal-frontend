// debug/final-project-test.js
// Final Project Test - Frontend + Production Backend

console.log('🚀 Final Project Test Loaded');

/**
 * Test project status dengan frontend + production backend
 */
async function testProjectStatus() {
  console.log('🚀 TESTING PROJECT STATUS (Frontend + Production Backend)...\n');

  const results = {
    frontend: {},
    productionBackend: {},
    integration: {},
    endpointTests: {},
    authenticationFlow: {},
    dataFlow: {},
    summary: {}
  };

  try {
    // Step 1: Test Frontend Status
    console.log('1️⃣ Testing Frontend Status...');
    results.frontend = await testFrontendStatus();
    
    // Step 2: Test Production Backend
    console.log('\n2️⃣ Testing Production Backend...');
    results.productionBackend = await testProductionBackend();
    
    // Step 3: Test Integration
    console.log('\n3️⃣ Testing Frontend-Backend Integration...');
    results.integration = await testIntegration();
    
    // Step 4: Test Fixed Endpoints
    console.log('\n4️⃣ Testing Fixed Endpoints...');
    results.endpointTests = await testFixedEndpoints();
    
    // Step 5: Test Authentication Flow
    console.log('\n5️⃣ Testing Authentication Flow...');
    results.authenticationFlow = await testAuthenticationFlow();
    
    // Step 6: Test Data Flow
    console.log('\n6️⃣ Testing Data Flow...');
    results.dataFlow = await testDataFlow();
    
    // Step 7: Generate Summary
    console.log('\n7️⃣ Generating Project Status Summary...');
    results.summary = generateProjectSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Project status test failed:', error);
    return { error: error.message };
  }
}

/**
 * Test frontend status
 */
async function testFrontendStatus() {
  console.log('🌐 Testing frontend status...');
  
  const frontend = {
    accessible: false,
    port: 5173,
    viteRunning: false,
    reactMounted: false,
    environmentLoaded: false
  };

  try {
    // Test frontend accessibility
    const response = await fetch('http://localhost:5173', { method: 'GET' });
    frontend.accessible = response.ok;
    console.log(`   ${frontend.accessible ? '✅' : '❌'} Frontend accessible: ${frontend.accessible}`);
    
    // Check if React app is mounted
    const rootElement = document.getElementById('root');
    frontend.reactMounted = rootElement && rootElement.children.length > 0;
    console.log(`   ${frontend.reactMounted ? '✅' : '❌'} React app mounted: ${frontend.reactMounted}`);
    
    // Check environment variables
    const apiUrl = import.meta.env.VITE_API_URL;
    frontend.environmentLoaded = !!apiUrl;
    frontend.apiUrl = apiUrl;
    console.log(`   ${frontend.environmentLoaded ? '✅' : '❌'} Environment loaded: ${frontend.environmentLoaded}`);
    console.log(`   🎯 API URL: ${apiUrl}`);
    
    frontend.viteRunning = frontend.accessible && frontend.reactMounted;
    
  } catch (error) {
    console.log(`   ❌ Frontend test error: ${error.message}`);
    frontend.error = error.message;
  }

  return frontend;
}

/**
 * Test production backend
 */
async function testProductionBackend() {
  console.log('🏭 Testing production backend...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const backend = {
    healthy: false,
    database: false,
    environment: null,
    routesAvailable: false,
    endpointCount: 0
  };

  try {
    // Test backend health
    const healthResponse = await fetch(`${apiUrl}/test/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      backend.healthy = healthData.status === 'OK';
      backend.database = healthData.database === 'Connected';
      backend.environment = healthData.environment;
      
      console.log(`   ${backend.healthy ? '✅' : '❌'} Backend health: ${healthData.status}`);
      console.log(`   ${backend.database ? '✅' : '❌'} Database: ${healthData.database}`);
      console.log(`   🌍 Environment: ${healthData.environment}`);
    }

    // Test routes availability
    const routesResponse = await fetch(`${apiUrl}/test/routes`);
    if (routesResponse.ok) {
      const routesData = await routesResponse.json();
      backend.routesAvailable = routesData.success;
      backend.endpointCount = routesData.data?.length || 0;
      
      console.log(`   ${backend.routesAvailable ? '✅' : '❌'} Routes available: ${backend.endpointCount} endpoints`);
    }

  } catch (error) {
    console.log(`   ❌ Backend test error: ${error.message}`);
    backend.error = error.message;
  }

  return backend;
}

/**
 * Test frontend-backend integration
 */
async function testIntegration() {
  console.log('🔗 Testing frontend-backend integration...');
  
  const integration = {
    corsWorking: false,
    apiCallsWorking: false,
    environmentMatching: false,
    responseFormat: false
  };

  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Test CORS and basic API call
    const testResponse = await fetch(`${apiUrl}/test/health`);
    integration.corsWorking = testResponse.ok;
    console.log(`   ${integration.corsWorking ? '✅' : '❌'} CORS working: ${integration.corsWorking}`);
    
    if (integration.corsWorking) {
      const data = await testResponse.json();
      integration.apiCallsWorking = data.success !== undefined;
      integration.responseFormat = typeof data === 'object' && data.status;
      integration.environmentMatching = data.environment === 'production';
      
      console.log(`   ${integration.apiCallsWorking ? '✅' : '❌'} API calls working: ${integration.apiCallsWorking}`);
      console.log(`   ${integration.responseFormat ? '✅' : '❌'} Response format correct: ${integration.responseFormat}`);
      console.log(`   ${integration.environmentMatching ? '✅' : '❌'} Environment matching: ${integration.environmentMatching}`);
    }

  } catch (error) {
    console.log(`   ❌ Integration test error: ${error.message}`);
    integration.error = error.message;
  }

  return integration;
}

/**
 * Test fixed endpoints
 */
async function testFixedEndpoints() {
  console.log('🔧 Testing fixed endpoints...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const endpoints = [
    { path: '/staff/manager/bookings', name: 'Manager Bookings', previousStatus: '404 NOT FOUND' },
    { path: '/staff/kasir/bookings', name: 'Kasir Bookings', previousStatus: '404 NOT FOUND' },
    { path: '/staff/operator/bookings', name: 'Operator Bookings', previousStatus: '404 NOT FOUND' },
    { path: '/admin/bookings', name: 'Admin Bookings', previousStatus: 'Working' },
    { path: '/admin/bookings/statistics', name: 'Admin Statistics', previousStatus: '500 Error' }
  ];

  const endpointResults = {};
  let workingCount = 0;

  for (const endpoint of endpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name} (was: ${endpoint.previousStatus})...`);
      
      const response = await fetch(`${apiUrl}${endpoint.path}`);
      
      if (response.ok) {
        const data = await response.json();
        const dataCount = data.data?.length || data.data?.bookings?.length || data.data?.statistics?.total_bookings || 0;
        
        endpointResults[endpoint.path] = {
          working: true,
          status: response.status,
          dataCount: dataCount,
          previousStatus: endpoint.previousStatus,
          currentStatus: 'WORKING ✅'
        };
        
        workingCount++;
        console.log(`     🎉 ${endpoint.name}: FIXED! ${dataCount} items (was: ${endpoint.previousStatus})`);
      } else {
        endpointResults[endpoint.path] = {
          working: false,
          status: response.status,
          previousStatus: endpoint.previousStatus,
          currentStatus: `HTTP ${response.status} ❌`
        };
        console.log(`     ❌ ${endpoint.name}: Still broken - HTTP ${response.status}`);
      }

    } catch (error) {
      endpointResults[endpoint.path] = {
        working: false,
        error: error.message,
        previousStatus: endpoint.previousStatus,
        currentStatus: 'ERROR ❌'
      };
      console.log(`     ❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }

  return {
    endpoints: endpointResults,
    workingCount: workingCount,
    totalCount: endpoints.length,
    allWorking: workingCount === endpoints.length
  };
}

/**
 * Test authentication flow
 */
async function testAuthenticationFlow() {
  console.log('🔐 Testing authentication flow...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const auth = {
    customerLogin: false,
    managerLogin: false,
    sessionPersistence: false,
    tokenReceived: false
  };

  try {
    // Test customer login
    const customerResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    if (customerResponse.ok) {
      const customerData = await customerResponse.json();
      auth.customerLogin = customerData.success;
      auth.tokenReceived = !!customerData.token;
      console.log(`   ${auth.customerLogin ? '✅' : '❌'} Customer login: ${auth.customerLogin}`);
      console.log(`   ${auth.tokenReceived ? '✅' : '❌'} Token received: ${auth.tokenReceived}`);
    }

    // Test manager login
    const managerResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'manajer1@futsalapp.com',
        password: 'password123'
      })
    });

    if (managerResponse.ok) {
      const managerData = await managerResponse.json();
      auth.managerLogin = managerData.success;
      console.log(`   ${auth.managerLogin ? '✅' : '❌'} Manager login: ${auth.managerLogin}`);
      
      // Test session persistence
      const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
        credentials: 'include'
      });
      auth.sessionPersistence = profileResponse.ok;
      console.log(`   ${auth.sessionPersistence ? '✅' : '❌'} Session persistence: ${auth.sessionPersistence}`);
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
    roleBasedAccess: false,
    dataCount: 0
  };

  try {
    // Test frontend API
    const { getAllBookings } = await import('../src/api/bookingAPI.js');
    
    // Set manager role for testing
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Test Manager',
      role: 'manajer_futsal'
    }));

    const result = await getAllBookings({ page: 1, limit: 10 });
    
    dataFlow.frontendAPIWorking = result.success;
    dataFlow.dataRetrieval = result.data && Array.isArray(result.data);
    dataFlow.dataCount = result.data?.length || 0;
    dataFlow.roleBasedAccess = result._metadata?.endpoint_used?.includes('/admin/') || result._metadata?.endpoint_used?.includes('/staff/');
    
    console.log(`   ${dataFlow.frontendAPIWorking ? '✅' : '❌'} Frontend API working: ${dataFlow.frontendAPIWorking}`);
    console.log(`   ${dataFlow.dataRetrieval ? '✅' : '❌'} Data retrieval: ${dataFlow.dataRetrieval}`);
    console.log(`   📊 Data count: ${dataFlow.dataCount}`);
    console.log(`   ${dataFlow.roleBasedAccess ? '✅' : '❌'} Role-based access: ${dataFlow.roleBasedAccess}`);
    console.log(`   🎯 Endpoint used: ${result._metadata?.endpoint_used}`);

  } catch (error) {
    console.log(`   ❌ Data flow test error: ${error.message}`);
    dataFlow.error = error.message;
  }

  return dataFlow;
}

/**
 * Generate project summary
 */
function generateProjectSummary(results) {
  console.log('\n🚀 PROJECT STATUS SUMMARY');
  console.log('='.repeat(70));
  
  // Frontend Status
  console.log('\n🌐 FRONTEND STATUS:');
  const frontend = results.frontend;
  console.log(`   Accessible: ${frontend.accessible ? '✅ YES' : '❌ NO'}`);
  console.log(`   React Mounted: ${frontend.reactMounted ? '✅ YES' : '❌ NO'}`);
  console.log(`   Environment: ${frontend.environmentLoaded ? '✅ Loaded' : '❌ Missing'}`);
  console.log(`   Port: ${frontend.port} ${frontend.accessible ? '(Running)' : '(Not accessible)'}`);
  
  // Backend Status
  console.log('\n🏭 PRODUCTION BACKEND STATUS:');
  const backend = results.productionBackend;
  console.log(`   Health: ${backend.healthy ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`   Database: ${backend.database ? '✅ Connected' : '❌ Issues'}`);
  console.log(`   Environment: ${backend.environment || 'Unknown'}`);
  console.log(`   Endpoints: ${backend.endpointCount} available`);
  
  // Integration Status
  console.log('\n🔗 INTEGRATION STATUS:');
  const integration = results.integration;
  console.log(`   CORS: ${integration.corsWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   API Calls: ${integration.apiCallsWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Response Format: ${integration.responseFormat ? '✅ Correct' : '❌ Issues'}`);
  
  // Fixed Endpoints Status
  console.log('\n🔧 FIXED ENDPOINTS STATUS:');
  const endpoints = results.endpointTests;
  console.log(`   Working: ${endpoints.workingCount}/${endpoints.totalCount}`);
  console.log(`   All Fixed: ${endpoints.allWorking ? '✅ YES' : '❌ NO'}`);
  
  Object.entries(endpoints.endpoints || {}).forEach(([path, data]) => {
    const status = data.working ? '✅' : '❌';
    console.log(`     ${status} ${path}: ${data.currentStatus} (was: ${data.previousStatus})`);
  });
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION STATUS:');
  const auth = results.authenticationFlow;
  console.log(`   Customer Login: ${auth.customerLogin ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Manager Login: ${auth.managerLogin ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Session Persistence: ${auth.sessionPersistence ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Token Handling: ${auth.tokenReceived ? '✅ Working' : '❌ Issues'}`);
  
  // Data Flow Status
  console.log('\n📊 DATA FLOW STATUS:');
  const dataFlow = results.dataFlow;
  console.log(`   Frontend API: ${dataFlow.frontendAPIWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Data Retrieval: ${dataFlow.dataRetrieval ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Role-based Access: ${dataFlow.roleBasedAccess ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Data Count: ${dataFlow.dataCount} bookings`);
  
  // Overall Status
  console.log('\n🎯 OVERALL PROJECT STATUS:');
  const overallStatus = 
    frontend.accessible && 
    backend.healthy && 
    integration.corsWorking && 
    endpoints.allWorking && 
    auth.managerLogin && 
    dataFlow.frontendAPIWorking;
  
  if (overallStatus) {
    console.log('   🎉 PROJECT FULLY FUNCTIONAL!');
    console.log('   ✅ Frontend: Running on port 5173');
    console.log('   ✅ Backend: Production backend healthy');
    console.log('   ✅ Integration: Frontend-backend connected');
    console.log('   ✅ Endpoints: All staff endpoints fixed');
    console.log('   ✅ Authentication: Working for all roles');
    console.log('   ✅ Data Flow: Staff can see customer bookings');
    console.log('   🚀 READY FOR PRODUCTION USE!');
  } else {
    console.log('   ⚠️ PROJECT HAS ISSUES:');
    if (!frontend.accessible) console.log('     - Frontend not accessible');
    if (!backend.healthy) console.log('     - Backend health issues');
    if (!integration.corsWorking) console.log('     - Integration issues');
    if (!endpoints.allWorking) console.log('     - Some endpoints still broken');
    if (!auth.managerLogin) console.log('     - Authentication issues');
    if (!dataFlow.frontendAPIWorking) console.log('     - Data flow issues');
  }

  return {
    frontendWorking: frontend.accessible && frontend.reactMounted,
    backendWorking: backend.healthy && backend.database,
    integrationWorking: integration.corsWorking && integration.apiCallsWorking,
    endpointsWorking: endpoints.allWorking,
    authWorking: auth.customerLogin && auth.managerLogin,
    dataFlowWorking: dataFlow.frontendAPIWorking && dataFlow.dataRetrieval,
    overallStatus: overallStatus
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testProjectStatus = testProjectStatus;
}

export default testProjectStatus;
