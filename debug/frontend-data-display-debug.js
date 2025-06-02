// debug/frontend-data-display-debug.js
// Debug Frontend Data Display Issues

console.log('🔍 Frontend Data Display Debug Loaded');

/**
 * Debug mengapa data tidak muncul di frontend meskipun API sudah working
 */
async function debugFrontendDataDisplay() {
  console.log('🔍 Debugging Frontend Data Display Issues...\n');

  const results = {
    apiConnection: {},
    authentication: {},
    dataRetrieval: {},
    uiComponents: {},
    routing: {},
    summary: {}
  };

  try {
    // Step 1: Test API Connection
    console.log('1️⃣ Testing API Connection...');
    results.apiConnection = await testAPIConnection();
    
    // Step 2: Test Authentication Flow
    console.log('\n2️⃣ Testing Authentication Flow...');
    results.authentication = await testAuthenticationFlow();
    
    // Step 3: Test Data Retrieval
    console.log('\n3️⃣ Testing Data Retrieval...');
    results.dataRetrieval = await testDataRetrieval();
    
    // Step 4: Check UI Components
    console.log('\n4️⃣ Checking UI Components...');
    results.uiComponents = checkUIComponents();
    
    // Step 5: Check Routing
    console.log('\n5️⃣ Checking Routing...');
    results.routing = checkRouting();
    
    // Step 6: Generate Summary
    console.log('\n6️⃣ Generating Debug Summary...');
    results.summary = generateDebugSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Frontend data display debug failed:', error);
    return { error: error.message };
  }
}

/**
 * Test API connection
 */
async function testAPIConnection() {
  console.log('🌐 Testing API connection...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`   🎯 API URL: ${apiUrl}`);
  
  const connection = {
    apiUrl: apiUrl,
    backendHealthy: false,
    corsWorking: false,
    environmentCorrect: false
  };

  try {
    // Test backend health
    const healthResponse = await fetch(`${apiUrl}/test/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      connection.backendHealthy = true;
      connection.environmentCorrect = healthData.environment === 'development';
      console.log(`   ✅ Backend: ${healthData.status} (${healthData.environment})`);
    } else {
      console.log(`   ❌ Backend health failed: HTTP ${healthResponse.status}`);
    }

    // Test CORS
    connection.corsWorking = healthResponse.ok;
    console.log(`   ${connection.corsWorking ? '✅' : '❌'} CORS: ${connection.corsWorking ? 'Working' : 'Issues detected'}`);

  } catch (error) {
    console.log(`   ❌ API connection error: ${error.message}`);
    connection.error = error.message;
  }

  return connection;
}

/**
 * Test authentication flow
 */
async function testAuthenticationFlow() {
  console.log('🔐 Testing authentication flow...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const auth = {
    loginWorking: false,
    tokenReceived: false,
    userDataStored: false,
    sessionPersistent: false
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

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      auth.loginWorking = true;
      auth.tokenReceived = !!loginData.token;
      console.log(`   ✅ Login: Success (${loginData.user.name})`);
      console.log(`   ${auth.tokenReceived ? '✅' : '❌'} Token: ${auth.tokenReceived ? 'Received' : 'Missing'}`);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(loginData.user));
      if (loginData.token) {
        localStorage.setItem('token', loginData.token);
      }
      auth.userDataStored = true;
      console.log(`   ✅ User data: Stored in localStorage`);
      
      // Test session persistence
      const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      
      auth.sessionPersistent = profileResponse.ok;
      console.log(`   ${auth.sessionPersistent ? '✅' : '❌'} Session: ${auth.sessionPersistent ? 'Persistent' : 'Not persistent'}`);
      
    } else {
      console.log(`   ❌ Login failed: ${loginData.error}`);
      auth.error = loginData.error;
    }

  } catch (error) {
    console.log(`   ❌ Authentication error: ${error.message}`);
    auth.error = error.message;
  }

  return auth;
}

/**
 * Test data retrieval
 */
async function testDataRetrieval() {
  console.log('📊 Testing data retrieval...');
  
  const retrieval = {
    frontendAPIWorking: false,
    backendEndpointsWorking: false,
    dataStructureCorrect: false,
    dataCount: 0,
    endpointUsed: null
  };

  try {
    // Test frontend API
    const { getAllBookings } = await import('../src/api/bookingAPI.js');
    
    console.log('   🔍 Testing getAllBookings...');
    const result = await getAllBookings({ page: 1, limit: 10 });
    
    if (result.success) {
      retrieval.frontendAPIWorking = true;
      retrieval.dataCount = result.data?.length || 0;
      retrieval.endpointUsed = result._metadata?.endpoint_used;
      retrieval.dataStructureCorrect = Array.isArray(result.data);
      
      console.log(`   ✅ Frontend API: Working`);
      console.log(`   📊 Data count: ${retrieval.dataCount}`);
      console.log(`   🎯 Endpoint used: ${retrieval.endpointUsed}`);
      console.log(`   📋 Data structure: ${retrieval.dataStructureCorrect ? 'Correct (Array)' : 'Incorrect'}`);
      
      if (retrieval.dataCount > 0) {
        const sample = result.data[0];
        console.log(`   📝 Sample data:`, {
          id: sample.id,
          name: sample.name || sample.user_name,
          status: sample.status,
          date: sample.date
        });
      } else {
        console.log(`   ⚠️ No data returned from API`);
      }
      
    } else {
      console.log(`   ❌ Frontend API failed: ${result.error}`);
      retrieval.error = result.error;
    }

    // Test direct backend endpoint
    console.log('   🔍 Testing direct backend endpoint...');
    const apiUrl = import.meta.env.VITE_API_URL;
    const directResponse = await fetch(`${apiUrl}/staff/manager/bookings`, {
      method: 'GET',
      credentials: 'include'
    });

    if (directResponse.ok) {
      const directData = await directResponse.json();
      retrieval.backendEndpointsWorking = true;
      console.log(`   ✅ Direct backend: Working (${directData.data?.length || 0} items)`);
    } else {
      console.log(`   ❌ Direct backend: HTTP ${directResponse.status}`);
    }

  } catch (error) {
    console.log(`   ❌ Data retrieval error: ${error.message}`);
    retrieval.error = error.message;
  }

  return retrieval;
}

/**
 * Check UI components
 */
function checkUIComponents() {
  console.log('🎨 Checking UI components...');
  
  const ui = {
    reactAppMounted: false,
    routerWorking: false,
    componentsLoaded: false,
    currentPath: window.location.pathname,
    currentHash: window.location.hash
  };

  try {
    // Check if React app is mounted
    const rootElement = document.getElementById('root');
    ui.reactAppMounted = rootElement && rootElement.children.length > 0;
    console.log(`   ${ui.reactAppMounted ? '✅' : '❌'} React app: ${ui.reactAppMounted ? 'Mounted' : 'Not mounted'}`);
    
    // Check current path
    console.log(`   📍 Current path: ${ui.currentPath}`);
    console.log(`   🔗 Current hash: ${ui.currentHash || 'None'}`);
    
    // Check for common components
    const commonSelectors = [
      '[data-testid="booking-list"]',
      '.booking-item',
      '[class*="booking"]',
      '[class*="dashboard"]',
      'table',
      '.loading',
      '.error'
    ];
    
    const foundComponents = [];
    commonSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundComponents.push(`${selector} (${elements.length})`);
      }
    });
    
    ui.componentsLoaded = foundComponents.length > 0;
    console.log(`   ${ui.componentsLoaded ? '✅' : '❌'} Components: ${foundComponents.length > 0 ? foundComponents.join(', ') : 'None found'}`);
    
    // Check for error messages
    const errorElements = document.querySelectorAll('.error, [class*="error"], [data-testid*="error"]');
    if (errorElements.length > 0) {
      console.log(`   ⚠️ Error elements found: ${errorElements.length}`);
      errorElements.forEach((el, index) => {
        console.log(`     ${index + 1}. ${el.textContent?.substring(0, 100) || 'No text'}`);
      });
    }

  } catch (error) {
    console.log(`   ❌ UI check error: ${error.message}`);
    ui.error = error.message;
  }

  return ui;
}

/**
 * Check routing
 */
function checkRouting() {
  console.log('🛣️ Checking routing...');
  
  const routing = {
    currentRoute: window.location.pathname,
    expectedRoutes: [
      '/login',
      '/dashboard',
      '/kelola-booking',
      '/staff/dashboard',
      '/admin/dashboard'
    ],
    routerConfigured: false
  };

  try {
    // Check if we're on the right route for booking management
    const isBookingRoute = routing.currentRoute.includes('booking') || 
                          routing.currentRoute.includes('kelola') ||
                          routing.currentRoute.includes('dashboard');
    
    console.log(`   📍 Current route: ${routing.currentRoute}`);
    console.log(`   ${isBookingRoute ? '✅' : '⚠️'} Booking route: ${isBookingRoute ? 'Yes' : 'No'}`);
    
    // Check if router is working
    routing.routerConfigured = typeof window.history?.pushState === 'function';
    console.log(`   ${routing.routerConfigured ? '✅' : '❌'} Router: ${routing.routerConfigured ? 'Configured' : 'Not configured'}`);
    
    // Check for navigation elements
    const navElements = document.querySelectorAll('nav, [class*="nav"], [class*="menu"]');
    console.log(`   🧭 Navigation elements: ${navElements.length} found`);

  } catch (error) {
    console.log(`   ❌ Routing check error: ${error.message}`);
    routing.error = error.message;
  }

  return routing;
}

/**
 * Generate debug summary
 */
function generateDebugSummary(results) {
  console.log('\n🔍 FRONTEND DATA DISPLAY DEBUG SUMMARY');
  console.log('='.repeat(70));
  
  // API Connection
  console.log('\n🌐 API CONNECTION:');
  const api = results.apiConnection;
  console.log(`   Backend: ${api.backendHealthy ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`   CORS: ${api.corsWorking ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Environment: ${api.environmentCorrect ? '✅ Correct' : '⚠️ Check config'}`);
  
  // Authentication
  console.log('\n🔐 AUTHENTICATION:');
  const auth = results.authentication;
  console.log(`   Login: ${auth.loginWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Token: ${auth.tokenReceived ? '✅ Received' : '❌ Missing'}`);
  console.log(`   Session: ${auth.sessionPersistent ? '✅ Persistent' : '❌ Not persistent'}`);
  
  // Data Retrieval
  console.log('\n📊 DATA RETRIEVAL:');
  const data = results.dataRetrieval;
  console.log(`   Frontend API: ${data.frontendAPIWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Backend Endpoints: ${data.backendEndpointsWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Data Count: ${data.dataCount} items`);
  console.log(`   Endpoint Used: ${data.endpointUsed || 'None'}`);
  
  // UI Components
  console.log('\n🎨 UI COMPONENTS:');
  const ui = results.uiComponents;
  console.log(`   React App: ${ui.reactAppMounted ? '✅ Mounted' : '❌ Not mounted'}`);
  console.log(`   Components: ${ui.componentsLoaded ? '✅ Loaded' : '❌ Missing'}`);
  console.log(`   Current Path: ${ui.currentPath}`);
  
  // Root Cause Analysis
  console.log('\n🎯 ROOT CAUSE ANALYSIS:');
  
  if (!api.backendHealthy) {
    console.log('   🚨 BACKEND CONNECTION ISSUES');
    console.log('   💡 Check if backend server is running on correct port');
  } else if (!auth.loginWorking) {
    console.log('   🚨 AUTHENTICATION ISSUES');
    console.log('   💡 Check login credentials and authentication flow');
  } else if (!data.frontendAPIWorking) {
    console.log('   🚨 FRONTEND API ISSUES');
    console.log('   💡 Check API integration and error handling');
  } else if (data.dataCount === 0) {
    console.log('   🚨 NO DATA RETURNED');
    console.log('   💡 Check if backend has booking data and endpoints return data');
  } else if (!ui.reactAppMounted) {
    console.log('   🚨 REACT APP NOT MOUNTED');
    console.log('   💡 Check React app initialization and routing');
  } else if (!ui.componentsLoaded) {
    console.log('   🚨 UI COMPONENTS NOT LOADED');
    console.log('   💡 Check component rendering and data binding');
  } else {
    console.log('   ✅ ALL SYSTEMS WORKING');
    console.log('   💡 Data should be visible in UI - check specific component logic');
  }

  return {
    apiWorking: api.backendHealthy && api.corsWorking,
    authWorking: auth.loginWorking && auth.sessionPersistent,
    dataWorking: data.frontendAPIWorking && data.dataCount > 0,
    uiWorking: ui.reactAppMounted && ui.componentsLoaded,
    overallStatus: api.backendHealthy && auth.loginWorking && data.frontendAPIWorking && ui.reactAppMounted
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.debugFrontendDataDisplay = debugFrontendDataDisplay;
}

export default debugFrontendDataDisplay;
