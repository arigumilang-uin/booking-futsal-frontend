// debug/api-error-detection.js
// Specific API Error Detection and Analysis

console.log('🔍 API Error Detection Script Loaded');

/**
 * Comprehensive API error detection
 */
async function detectAPIErrors() {
  console.log('🔍 Starting API Error Detection...\n');

  const results = {
    backend: {},
    authentication: {},
    booking: {},
    staff: {},
    errors: [],
    summary: {}
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`🌐 Testing API: ${apiUrl}`);

  try {
    // Test 1: Backend Health
    console.log('\n1️⃣ Testing Backend Health API...');
    results.backend = await testBackendHealth(apiUrl);
    
    // Test 2: Authentication APIs
    console.log('\n2️⃣ Testing Authentication APIs...');
    results.authentication = await testAuthenticationAPIs(apiUrl);
    
    // Test 3: Booking APIs
    console.log('\n3️⃣ Testing Booking APIs...');
    results.booking = await testBookingAPIs(apiUrl);
    
    // Test 4: Staff APIs
    console.log('\n4️⃣ Testing Staff APIs...');
    results.staff = await testStaffAPIs(apiUrl);
    
    // Test 5: Generate Error Analysis
    console.log('\n5️⃣ Analyzing Errors...');
    results.summary = analyzeErrors(results);
    
    // Generate Report
    console.log('\n📊 Generating Error Report...');
    generateErrorReport(results);
    
    return results;

  } catch (error) {
    console.error('❌ API error detection failed:', error);
    return { error: error.message };
  }
}

/**
 * Test backend health API
 */
async function testBackendHealth(apiUrl) {
  console.log('🏥 Testing backend health...');
  
  const health = {
    accessible: false,
    status: null,
    database: null,
    environment: null,
    error: null
  };

  try {
    const response = await fetch(`${apiUrl}/test/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      health.accessible = true;
      health.status = data.status;
      health.database = data.database;
      health.environment = data.environment;
      
      console.log(`   ✅ Backend: ${data.status}`);
      console.log(`   📊 Database: ${data.database}`);
      console.log(`   🌍 Environment: ${data.environment}`);
    } else {
      health.error = `HTTP ${response.status}: ${response.statusText}`;
      console.log(`   ❌ Backend health failed: ${health.error}`);
    }

  } catch (error) {
    health.error = error.message;
    console.log(`   ❌ Backend health error: ${error.message}`);
  }

  return health;
}

/**
 * Test authentication APIs
 */
async function testAuthenticationAPIs(apiUrl) {
  console.log('🔐 Testing authentication APIs...');
  
  const auth = {
    login: { success: false, error: null },
    profile: { success: false, error: null },
    refresh: { success: false, error: null }
  };

  // Test Login API
  try {
    console.log('   🔍 Testing login API...');
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      auth.login.success = loginData.success;
      auth.login.user = loginData.user;
      auth.login.hasToken = !!loginData.token;
      
      console.log(`     ✅ Login: ${loginData.success ? 'Success' : 'Failed'}`);
      console.log(`     👤 User: ${loginData.user?.name} (${loginData.user?.role})`);
      console.log(`     🔑 Token in response: ${auth.login.hasToken ? 'Yes' : 'No'}`);

      // Test Profile API (if login successful)
      if (loginData.success) {
        try {
          console.log('   🔍 Testing profile API...');
          const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
            method: 'GET',
            credentials: 'include'
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            auth.profile.success = profileData.success;
            console.log(`     ✅ Profile: ${profileData.success ? 'Success' : 'Failed'}`);
          } else {
            auth.profile.error = `HTTP ${profileResponse.status}`;
            console.log(`     ❌ Profile: HTTP ${profileResponse.status}`);
          }
        } catch (error) {
          auth.profile.error = error.message;
          console.log(`     ❌ Profile error: ${error.message}`);
        }

        // Test Refresh API
        try {
          console.log('   🔍 Testing refresh API...');
          const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            auth.refresh.success = refreshData.success;
            auth.refresh.hasToken = !!refreshData.token;
            console.log(`     ✅ Refresh: ${refreshData.success ? 'Success' : 'Failed'}`);
            console.log(`     🔑 Token in refresh: ${auth.refresh.hasToken ? 'Yes' : 'No'}`);
          } else {
            auth.refresh.error = `HTTP ${refreshResponse.status}`;
            console.log(`     ❌ Refresh: HTTP ${refreshResponse.status}`);
          }
        } catch (error) {
          auth.refresh.error = error.message;
          console.log(`     ❌ Refresh error: ${error.message}`);
        }
      }

    } else {
      auth.login.error = `HTTP ${loginResponse.status}`;
      console.log(`     ❌ Login failed: HTTP ${loginResponse.status}`);
    }

  } catch (error) {
    auth.login.error = error.message;
    console.log(`     ❌ Login error: ${error.message}`);
  }

  return auth;
}

/**
 * Test booking APIs
 */
async function testBookingAPIs(apiUrl) {
  console.log('📋 Testing booking APIs...');
  
  const booking = {
    customerBookings: { success: false, error: null, count: 0 },
    createBooking: { success: false, error: null },
    publicFields: { success: false, error: null, count: 0 }
  };

  // Test Customer Bookings API
  try {
    console.log('   🔍 Testing customer bookings API...');
    const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
      method: 'GET',
      credentials: 'include'
    });

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      booking.customerBookings.success = bookingsData.success;
      booking.customerBookings.count = bookingsData.data?.length || 0;
      
      console.log(`     ✅ Customer bookings: ${bookingsData.success ? 'Success' : 'Failed'}`);
      console.log(`     📊 Bookings count: ${booking.customerBookings.count}`);
    } else {
      booking.customerBookings.error = `HTTP ${bookingsResponse.status}`;
      console.log(`     ❌ Customer bookings: HTTP ${bookingsResponse.status}`);
    }

  } catch (error) {
    booking.customerBookings.error = error.message;
    console.log(`     ❌ Customer bookings error: ${error.message}`);
  }

  // Test Public Fields API
  try {
    console.log('   🔍 Testing public fields API...');
    const fieldsResponse = await fetch(`${apiUrl}/public/fields`, {
      method: 'GET'
    });

    if (fieldsResponse.ok) {
      const fieldsData = await fieldsResponse.json();
      booking.publicFields.success = fieldsData.success;
      booking.publicFields.count = fieldsData.data?.length || 0;
      
      console.log(`     ✅ Public fields: ${fieldsData.success ? 'Success' : 'Failed'}`);
      console.log(`     🏟️ Fields count: ${booking.publicFields.count}`);
    } else {
      booking.publicFields.error = `HTTP ${fieldsResponse.status}`;
      console.log(`     ❌ Public fields: HTTP ${fieldsResponse.status}`);
    }

  } catch (error) {
    booking.publicFields.error = error.message;
    console.log(`     ❌ Public fields error: ${error.message}`);
  }

  return booking;
}

/**
 * Test staff APIs
 */
async function testStaffAPIs(apiUrl) {
  console.log('👥 Testing staff APIs...');
  
  const staff = {
    managerLogin: { success: false, error: null },
    managerBookings: { success: false, error: null, count: 0 },
    kasirBookings: { success: false, error: null, count: 0 },
    adminBookings: { success: false, error: null, count: 0 }
  };

  // Login as manager first
  try {
    console.log('   🔍 Testing manager login...');
    const managerLoginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'manajer1@futsalapp.com',
        password: 'password123'
      })
    });

    if (managerLoginResponse.ok) {
      const managerData = await managerLoginResponse.json();
      staff.managerLogin.success = managerData.success;
      staff.managerLogin.user = managerData.user;
      
      console.log(`     ✅ Manager login: ${managerData.success ? 'Success' : 'Failed'}`);
      console.log(`     👤 Manager: ${managerData.user?.name} (${managerData.user?.role})`);

      if (managerData.success) {
        // Test Manager Bookings API
        const staffEndpoints = [
          { path: '/staff/manager/bookings', key: 'managerBookings', name: 'Manager bookings' },
          { path: '/staff/kasir/bookings', key: 'kasirBookings', name: 'Kasir bookings' },
          { path: '/admin/bookings', key: 'adminBookings', name: 'Admin bookings' }
        ];

        for (const endpoint of staffEndpoints) {
          try {
            console.log(`   🔍 Testing ${endpoint.name} API...`);
            const response = await fetch(`${apiUrl}${endpoint.path}`, {
              method: 'GET',
              credentials: 'include'
            });

            if (response.ok) {
              const data = await response.json();
              staff[endpoint.key].success = data.success;
              staff[endpoint.key].count = data.data?.length || 0;
              
              console.log(`     ✅ ${endpoint.name}: ${data.success ? 'Success' : 'Failed'}`);
              console.log(`     📊 Count: ${staff[endpoint.key].count}`);
            } else {
              staff[endpoint.key].error = `HTTP ${response.status}`;
              console.log(`     ❌ ${endpoint.name}: HTTP ${response.status}`);
            }

          } catch (error) {
            staff[endpoint.key].error = error.message;
            console.log(`     ❌ ${endpoint.name} error: ${error.message}`);
          }
        }
      }

    } else {
      staff.managerLogin.error = `HTTP ${managerLoginResponse.status}`;
      console.log(`     ❌ Manager login: HTTP ${managerLoginResponse.status}`);
    }

  } catch (error) {
    staff.managerLogin.error = error.message;
    console.log(`     ❌ Manager login error: ${error.message}`);
  }

  return staff;
}

/**
 * Analyze errors and identify patterns
 */
function analyzeErrors(results) {
  console.log('🔍 Analyzing error patterns...');
  
  const analysis = {
    criticalErrors: [],
    workingAPIs: [],
    failingAPIs: [],
    authenticationIssues: false,
    bookingDataIssues: false,
    staffAccessIssues: false,
    backendIssues: false
  };

  // Check backend health
  if (!results.backend.accessible) {
    analysis.criticalErrors.push('Backend not accessible');
    analysis.backendIssues = true;
  } else {
    analysis.workingAPIs.push('Backend health');
  }

  // Check authentication
  if (!results.authentication.login.success) {
    analysis.criticalErrors.push('Authentication login failed');
    analysis.authenticationIssues = true;
  } else {
    analysis.workingAPIs.push('Authentication login');
    
    if (!results.authentication.profile.success) {
      analysis.failingAPIs.push('Authentication profile');
    } else {
      analysis.workingAPIs.push('Authentication profile');
    }
  }

  // Check booking APIs
  if (!results.booking.customerBookings.success) {
    analysis.criticalErrors.push('Customer bookings API failed');
    analysis.bookingDataIssues = true;
  } else {
    analysis.workingAPIs.push('Customer bookings');
    
    if (results.booking.customerBookings.count === 0) {
      analysis.failingAPIs.push('Customer bookings (no data)');
    }
  }

  // Check staff APIs
  if (!results.staff.managerLogin.success) {
    analysis.criticalErrors.push('Staff login failed');
    analysis.staffAccessIssues = true;
  } else {
    analysis.workingAPIs.push('Staff login');
    
    const staffAPIs = ['managerBookings', 'kasirBookings', 'adminBookings'];
    staffAPIs.forEach(api => {
      if (!results.staff[api].success) {
        analysis.failingAPIs.push(`Staff ${api}`);
        analysis.staffAccessIssues = true;
      } else {
        analysis.workingAPIs.push(`Staff ${api}`);
      }
    });
  }

  console.log(`   🚨 Critical errors: ${analysis.criticalErrors.length}`);
  console.log(`   ✅ Working APIs: ${analysis.workingAPIs.length}`);
  console.log(`   ❌ Failing APIs: ${analysis.failingAPIs.length}`);

  return analysis;
}

/**
 * Generate comprehensive error report
 */
function generateErrorReport(results) {
  console.log('\n📊 API ERROR DETECTION REPORT');
  console.log('='.repeat(60));
  
  // Backend Status
  console.log('\n🏥 BACKEND STATUS:');
  if (results.backend.accessible) {
    console.log(`   ✅ Backend: ${results.backend.status}`);
    console.log(`   📊 Database: ${results.backend.database}`);
    console.log(`   🌍 Environment: ${results.backend.environment}`);
  } else {
    console.log(`   ❌ Backend: Not accessible - ${results.backend.error}`);
  }
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION STATUS:');
  console.log(`   Login: ${results.authentication.login.success ? '✅' : '❌'} ${results.authentication.login.error || 'Success'}`);
  console.log(`   Profile: ${results.authentication.profile.success ? '✅' : '❌'} ${results.authentication.profile.error || 'Success'}`);
  console.log(`   Refresh: ${results.authentication.refresh.success ? '✅' : '❌'} ${results.authentication.refresh.error || 'Success'}`);
  console.log(`   Token in login: ${results.authentication.login.hasToken ? 'Yes' : 'No'}`);
  console.log(`   Token in refresh: ${results.authentication.refresh.hasToken ? 'Yes' : 'No'}`);
  
  // Booking APIs Status
  console.log('\n📋 BOOKING APIs STATUS:');
  console.log(`   Customer bookings: ${results.booking.customerBookings.success ? '✅' : '❌'} ${results.booking.customerBookings.error || `${results.booking.customerBookings.count} bookings`}`);
  console.log(`   Public fields: ${results.booking.publicFields.success ? '✅' : '❌'} ${results.booking.publicFields.error || `${results.booking.publicFields.count} fields`}`);
  
  // Staff APIs Status
  console.log('\n👥 STAFF APIs STATUS:');
  console.log(`   Manager login: ${results.staff.managerLogin.success ? '✅' : '❌'} ${results.staff.managerLogin.error || 'Success'}`);
  console.log(`   Manager bookings: ${results.staff.managerBookings.success ? '✅' : '❌'} ${results.staff.managerBookings.error || `${results.staff.managerBookings.count} bookings`}`);
  console.log(`   Kasir bookings: ${results.staff.kasirBookings.success ? '✅' : '❌'} ${results.staff.kasirBookings.error || `${results.staff.kasirBookings.count} bookings`}`);
  console.log(`   Admin bookings: ${results.staff.adminBookings.success ? '✅' : '❌'} ${results.staff.adminBookings.error || `${results.staff.adminBookings.count} bookings`}`);
  
  // Error Analysis
  console.log('\n🔍 ERROR ANALYSIS:');
  if (results.summary.criticalErrors.length > 0) {
    console.log('   🚨 Critical Errors:');
    results.summary.criticalErrors.forEach(error => {
      console.log(`     - ${error}`);
    });
  }
  
  if (results.summary.failingAPIs.length > 0) {
    console.log('   ❌ Failing APIs:');
    results.summary.failingAPIs.forEach(api => {
      console.log(`     - ${api}`);
    });
  }
  
  console.log('   ✅ Working APIs:');
  results.summary.workingAPIs.forEach(api => {
    console.log(`     - ${api}`);
  });
  
  // Root Cause Analysis
  console.log('\n🎯 ROOT CAUSE ANALYSIS:');
  if (results.summary.backendIssues) {
    console.log('   🚨 BACKEND CONNECTIVITY ISSUES');
  } else if (results.summary.authenticationIssues) {
    console.log('   🚨 AUTHENTICATION SYSTEM ISSUES');
  } else if (results.summary.staffAccessIssues) {
    console.log('   🚨 STAFF API ACCESS ISSUES (Main Problem)');
    console.log('   💡 Staff endpoints may not exist or have permission issues');
  } else if (results.summary.bookingDataIssues) {
    console.log('   🚨 BOOKING DATA RETRIEVAL ISSUES');
  } else {
    console.log('   ✅ All core APIs working - Issue may be in data synchronization');
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.detectAPIErrors = detectAPIErrors;
}

export default detectAPIErrors;
