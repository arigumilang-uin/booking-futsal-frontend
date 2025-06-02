// debug/backend-endpoint-failure-test.js
// Test Backend Endpoints yang Gagal di Frontend (NO BACKEND CHANGES)

console.log('🔍 Backend Endpoint Failure Test Loaded');

/**
 * Test backend endpoints yang gagal di frontend tanpa mengubah backend
 */
async function testBackendEndpointFailures() {
  console.log('🔍 Testing Backend Endpoint Failures (NO BACKEND CHANGES)...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  const results = {
    backendHealth: {},
    customerData: {},
    staffAuthentication: {},
    endpointTests: {},
    adminEndpoints: {},
    analysis: {}
  };

  try {
    // Step 1: Backend Health Check
    console.log('1️⃣ Backend Health Check...');
    results.backendHealth = await testBackendHealth(apiUrl);
    
    // Step 2: Customer Data Verification
    console.log('\n2️⃣ Customer Data Verification...');
    results.customerData = await testCustomerData(apiUrl);
    
    // Step 3: Staff Authentication
    console.log('\n3️⃣ Staff Authentication Test...');
    results.staffAuthentication = await testStaffAuthentication(apiUrl);
    
    // Step 4: Endpoint Tests
    console.log('\n4️⃣ Endpoint Availability Tests...');
    results.endpointTests = await testEndpointAvailability(apiUrl);
    
    // Step 5: Admin Endpoints (New)
    console.log('\n5️⃣ Admin Endpoints Test...');
    results.adminEndpoints = await testAdminEndpoints(apiUrl);
    
    // Step 6: Analysis
    console.log('\n6️⃣ Failure Analysis...');
    results.analysis = analyzeFailures(results);
    
    return results;

  } catch (error) {
    console.error('❌ Backend endpoint failure test failed:', error);
    return { error: error.message };
  }
}

/**
 * Test backend health
 */
async function testBackendHealth(apiUrl) {
  console.log('🏥 Testing backend health...');
  
  try {
    const response = await fetch(`${apiUrl}/test/health`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Backend: ${data.status}`);
      console.log(`   📊 Database: ${data.database}`);
      console.log(`   🌍 Environment: ${data.environment}`);
      
      return {
        accessible: true,
        status: data.status,
        database: data.database,
        environment: data.environment
      };
    } else {
      console.log(`   ❌ Backend health failed: HTTP ${response.status}`);
      return {
        accessible: false,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    console.log(`   ❌ Backend health error: ${error.message}`);
    return {
      accessible: false,
      error: error.message
    };
  }
}

/**
 * Test customer data
 */
async function testCustomerData(apiUrl) {
  console.log('👤 Testing customer data...');
  
  try {
    // Login as customer
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log(`   ✅ Customer login: ${loginData.user.name}`);
      
      // Get customer bookings
      const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });

      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        console.log(`   📊 Customer bookings: ${bookingsData.data.length}`);
        
        if (bookingsData.data.length > 0) {
          const sample = bookingsData.data[0];
          console.log(`   📋 Sample: ID ${sample.id}, Status: ${sample.status}, User: ${sample.name}`);
        }
        
        return {
          loginSuccess: true,
          bookingCount: bookingsData.data.length,
          hasData: bookingsData.data.length > 0,
          sampleBooking: bookingsData.data[0] || null
        };
      }
    }
    
    return {
      loginSuccess: false,
      error: loginData.error
    };

  } catch (error) {
    console.log(`   ❌ Customer data test failed: ${error.message}`);
    return {
      loginSuccess: false,
      error: error.message
    };
  }
}

/**
 * Test staff authentication
 */
async function testStaffAuthentication(apiUrl) {
  console.log('👥 Testing staff authentication...');
  
  const staffAccounts = [
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir', name: 'Kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal', name: 'Manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem', name: 'Supervisor' }
  ];

  const authResults = {};

  for (const staff of staffAccounts) {
    try {
      console.log(`   🔍 Testing ${staff.name}...`);
      
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: staff.email,
          password: staff.password
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        authResults[staff.role] = {
          loginSuccess: true,
          user: loginData.user,
          name: loginData.user.name,
          role: loginData.user.role
        };
        console.log(`     ✅ ${staff.name}: ${loginData.user.name} (${loginData.user.role})`);
      } else {
        authResults[staff.role] = {
          loginSuccess: false,
          error: loginData.error
        };
        console.log(`     ❌ ${staff.name}: ${loginData.error}`);
      }

    } catch (error) {
      authResults[staff.role] = {
        loginSuccess: false,
        error: error.message
      };
      console.log(`     ❌ ${staff.name}: ${error.message}`);
    }
  }

  return authResults;
}

/**
 * Test endpoint availability
 */
async function testEndpointAvailability(apiUrl) {
  console.log('🌐 Testing endpoint availability...');
  
  // Login as manager first
  const managerLogin = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: 'manajer1@futsalapp.com',
      password: 'password123'
    })
  });

  const managerData = await managerLogin.json();
  if (!managerData.success) {
    return { error: 'Manager login failed for endpoint testing' };
  }

  console.log(`   🔐 Testing as: ${managerData.user.name} (${managerData.user.role})`);

  const endpoints = [
    { path: '/staff/manager/bookings', name: 'Manager Bookings' },
    { path: '/staff/kasir/bookings', name: 'Kasir Bookings' },
    { path: '/staff/operator/bookings', name: 'Operator Bookings' },
    { path: '/customer/bookings', name: 'Customer Bookings (Fallback)' }
  ];

  const endpointResults = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name}: ${endpoint.path}...`);
      
      const response = await fetch(`${apiUrl}${endpoint.path}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        endpointResults[endpoint.path] = {
          available: true,
          status: response.status,
          success: data.success,
          dataCount: data.data?.length || 0,
          hasBookings: data.data && data.data.length > 0
        };
        console.log(`     ✅ ${endpoint.name}: ${data.data?.length || 0} bookings`);
      } else {
        const errorText = await response.text();
        endpointResults[endpoint.path] = {
          available: false,
          status: response.status,
          error: errorText
        };
        console.log(`     ❌ ${endpoint.name}: HTTP ${response.status}`);
      }

    } catch (error) {
      endpointResults[endpoint.path] = {
        available: false,
        error: error.message
      };
      console.log(`     ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  return endpointResults;
}

/**
 * Test admin endpoints (new ones added by friend)
 */
async function testAdminEndpoints(apiUrl) {
  console.log('👑 Testing admin endpoints...');
  
  const adminEndpoints = [
    { path: '/admin/bookings', name: 'Admin Get All Bookings' },
    { path: '/admin/bookings/statistics', name: 'Admin Booking Statistics' }
  ];

  const adminResults = {};

  for (const endpoint of adminEndpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name}: ${endpoint.path}...`);
      
      const response = await fetch(`${apiUrl}${endpoint.path}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        let dataCount = 0;
        if (endpoint.path === '/admin/bookings') {
          dataCount = data.data?.bookings?.length || 0;
        } else if (endpoint.path === '/admin/bookings/statistics') {
          dataCount = data.data?.statistics?.total_bookings || 0;
        }
        
        adminResults[endpoint.path] = {
          available: true,
          status: response.status,
          success: data.success,
          dataCount: dataCount,
          responseStructure: endpoint.path === '/admin/bookings' ? 'admin' : 'statistics'
        };
        console.log(`     ✅ ${endpoint.name}: ${dataCount} items`);
      } else {
        const errorText = await response.text();
        adminResults[endpoint.path] = {
          available: false,
          status: response.status,
          error: errorText
        };
        console.log(`     ❌ ${endpoint.name}: HTTP ${response.status}`);
      }

    } catch (error) {
      adminResults[endpoint.path] = {
        available: false,
        error: error.message
      };
      console.log(`     ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  return adminResults;
}

/**
 * Analyze failures
 */
function analyzeFailures(results) {
  console.log('🔍 Analyzing failures...');
  
  const analysis = {
    backendHealthy: results.backendHealth?.accessible || false,
    customerDataExists: results.customerData?.hasData || false,
    staffCanLogin: Object.values(results.staffAuthentication || {}).some(s => s.loginSuccess),
    workingEndpoints: [],
    failingEndpoints: [],
    adminEndpointsWorking: [],
    adminEndpointsFailing: [],
    rootCause: 'unknown'
  };

  // Analyze staff endpoints
  Object.entries(results.endpointTests || {}).forEach(([endpoint, data]) => {
    if (data.available && data.success) {
      analysis.workingEndpoints.push(endpoint);
    } else {
      analysis.failingEndpoints.push(endpoint);
    }
  });

  // Analyze admin endpoints
  Object.entries(results.adminEndpoints || {}).forEach(([endpoint, data]) => {
    if (data.available && data.success) {
      analysis.adminEndpointsWorking.push(endpoint);
    } else {
      analysis.adminEndpointsFailing.push(endpoint);
    }
  });

  // Determine root cause
  if (!analysis.backendHealthy) {
    analysis.rootCause = 'backend_connectivity';
  } else if (!analysis.customerDataExists) {
    analysis.rootCause = 'no_customer_data';
  } else if (!analysis.staffCanLogin) {
    analysis.rootCause = 'staff_authentication';
  } else if (analysis.adminEndpointsWorking.length > 0) {
    analysis.rootCause = 'admin_endpoints_working';
  } else if (analysis.workingEndpoints.length === 0) {
    analysis.rootCause = 'all_staff_endpoints_missing';
  } else {
    analysis.rootCause = 'partial_endpoints_working';
  }

  console.log(`   📊 Backend healthy: ${analysis.backendHealthy}`);
  console.log(`   📊 Customer data exists: ${analysis.customerDataExists}`);
  console.log(`   📊 Staff can login: ${analysis.staffCanLogin}`);
  console.log(`   📊 Working endpoints: ${analysis.workingEndpoints.length}`);
  console.log(`   📊 Admin endpoints working: ${analysis.adminEndpointsWorking.length}`);
  console.log(`   🎯 Root cause: ${analysis.rootCause}`);

  // Generate final report
  console.log('\n📊 BACKEND ENDPOINT FAILURE ANALYSIS REPORT');
  console.log('='.repeat(60));
  
  console.log('\n🏥 BACKEND STATUS:');
  console.log(`   Health: ${analysis.backendHealthy ? '✅ Healthy' : '❌ Issues'}`);
  console.log(`   Customer data: ${analysis.customerDataExists ? '✅ Available' : '❌ Missing'}`);
  console.log(`   Staff auth: ${analysis.staffCanLogin ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🌐 ENDPOINT STATUS:');
  console.log(`   Working staff endpoints: ${analysis.workingEndpoints.length}`);
  analysis.workingEndpoints.forEach(ep => console.log(`     ✅ ${ep}`));
  
  console.log(`   Failing staff endpoints: ${analysis.failingEndpoints.length}`);
  analysis.failingEndpoints.forEach(ep => console.log(`     ❌ ${ep}`));
  
  console.log(`   Working admin endpoints: ${analysis.adminEndpointsWorking.length}`);
  analysis.adminEndpointsWorking.forEach(ep => console.log(`     ✅ ${ep}`));
  
  console.log(`   Failing admin endpoints: ${analysis.adminEndpointsFailing.length}`);
  analysis.adminEndpointsFailing.forEach(ep => console.log(`     ❌ ${ep}`));
  
  console.log('\n🎯 ROOT CAUSE ANALYSIS:');
  switch (analysis.rootCause) {
    case 'backend_connectivity':
      console.log('   🚨 BACKEND CONNECTIVITY ISSUES');
      console.log('   💡 Backend server not accessible or unhealthy');
      break;
    case 'no_customer_data':
      console.log('   🚨 NO CUSTOMER BOOKING DATA');
      console.log('   💡 No booking data exists for testing');
      break;
    case 'staff_authentication':
      console.log('   🚨 STAFF AUTHENTICATION ISSUES');
      console.log('   💡 Staff accounts cannot login');
      break;
    case 'admin_endpoints_working':
      console.log('   ✅ ADMIN ENDPOINTS WORKING!');
      console.log('   💡 New admin endpoints are available and functional');
      console.log('   💡 Frontend should prioritize admin endpoints for management roles');
      break;
    case 'all_staff_endpoints_missing':
      console.log('   🚨 ALL STAFF ENDPOINTS MISSING');
      console.log('   💡 No staff booking endpoints are deployed');
      console.log('   💡 Need to deploy staff endpoint implementations');
      break;
    case 'partial_endpoints_working':
      console.log('   ⚠️ PARTIAL ENDPOINTS WORKING');
      console.log('   💡 Some endpoints work, others need deployment');
      break;
    default:
      console.log('   ❓ UNKNOWN ISSUE');
  }

  return analysis;
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testBackendEndpointFailures = testBackendEndpointFailures;
}

export default testBackendEndpointFailures;
