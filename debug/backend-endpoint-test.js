// debug/backend-endpoint-test.js
// Test Backend Booking Endpoints untuk Role-based Access

console.log('🔍 Backend Endpoint Test Loaded');

/**
 * Test backend booking endpoints untuk semua role
 */
async function testBackendBookingEndpoints() {
  console.log('🔍 Testing Backend Booking Endpoints...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  const results = {
    customerData: {},
    staffEndpoints: {},
    roleAccess: {},
    summary: {}
  };

  try {
    // Step 1: Verify Customer Data Exists
    console.log('1️⃣ Verifying Customer Booking Data...');
    results.customerData = await verifyCustomerBookingData(apiUrl);
    
    // Step 2: Test Staff Endpoints
    console.log('\n2️⃣ Testing Staff Booking Endpoints...');
    results.staffEndpoints = await testStaffBookingEndpoints(apiUrl);
    
    // Step 3: Test Role-based Access
    console.log('\n3️⃣ Testing Role-based Access...');
    results.roleAccess = await testRoleBasedBookingAccess(apiUrl);
    
    // Step 4: Generate Summary
    console.log('\n4️⃣ Generating Test Summary...');
    results.summary = generateEndpointTestSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Backend endpoint test failed:', error);
    return { error: error.message };
  }
}

/**
 * Verify customer booking data exists
 */
async function verifyCustomerBookingData(apiUrl) {
  console.log('👤 Verifying customer booking data...');
  
  const customerData = {
    loginSuccess: false,
    bookingCount: 0,
    bookingDetails: [],
    dataAvailable: false
  };

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
    customerData.loginSuccess = loginData.success;

    if (loginData.success) {
      console.log(`   ✅ Customer login: ${loginData.user.name}`);
      
      // Get customer bookings
      const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });

      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        customerData.bookingCount = bookingsData.data.length;
        customerData.bookingDetails = bookingsData.data;
        customerData.dataAvailable = bookingsData.data.length > 0;
        
        console.log(`   📊 Customer bookings: ${customerData.bookingCount}`);
        
        if (customerData.dataAvailable) {
          const sample = bookingsData.data[0];
          console.log(`   📋 Sample booking: ID ${sample.id}, Status: ${sample.status}, User: ${sample.user_name || sample.name}`);
        }
      }
    } else {
      console.log(`   ❌ Customer login failed: ${loginData.error}`);
    }

    return customerData;

  } catch (error) {
    console.error('   ❌ Customer data verification failed:', error);
    return { ...customerData, error: error.message };
  }
}

/**
 * Test staff booking endpoints
 */
async function testStaffBookingEndpoints(apiUrl) {
  console.log('👥 Testing staff booking endpoints...');
  
  const endpoints = [
    { path: '/staff/manager/bookings', name: 'Manager Bookings', expectedRole: 'manajer_futsal' },
    { path: '/staff/kasir/bookings', name: 'Kasir Bookings', expectedRole: 'staff_kasir' },
    { path: '/admin/bookings', name: 'Admin Bookings', expectedRole: 'supervisor_sistem' },
    { path: '/customer/bookings', name: 'Customer Bookings (Fallback)', expectedRole: 'any' }
  ];

  const endpointResults = {};

  // Login as manager first for testing
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
    console.log('   ❌ Manager login failed, cannot test staff endpoints');
    return { error: 'Manager login failed' };
  }

  console.log(`   🔐 Testing as: ${managerData.user.name} (${managerData.user.role})`);

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
          success: true,
          status: response.status,
          dataCount: data.data?.length || 0,
          hasBookings: data.data && data.data.length > 0,
          responseStructure: {
            hasSuccess: 'success' in data,
            hasData: 'data' in data,
            hasPagination: 'pagination' in data
          },
          sampleData: data.data?.slice(0, 1) || [],
          name: endpoint.name
        };
        
        console.log(`     ✅ ${endpoint.name}: ${data.data?.length || 0} bookings`);
        
        if (data.data?.length > 0) {
          const sample = data.data[0];
          console.log(`     📋 Sample: ID ${sample.id}, User: ${sample.user_name || sample.name}, Status: ${sample.status}`);
        }
        
      } else {
        const errorText = await response.text();
        endpointResults[endpoint.path] = {
          success: false,
          status: response.status,
          error: errorText,
          name: endpoint.name
        };
        console.log(`     ❌ ${endpoint.name}: HTTP ${response.status}`);
      }

    } catch (error) {
      endpointResults[endpoint.path] = {
        success: false,
        error: error.message,
        name: endpoint.name
      };
      console.log(`     ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  return endpointResults;
}

/**
 * Test role-based booking access
 */
async function testRoleBasedBookingAccess(apiUrl) {
  console.log('🔐 Testing role-based booking access...');
  
  const roles = [
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir', name: 'Kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal', name: 'Manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem', name: 'Supervisor' }
  ];

  const roleResults = {};

  for (const roleAccount of roles) {
    try {
      console.log(`   🔍 Testing ${roleAccount.name} (${roleAccount.role})...`);
      
      // Login as role
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: roleAccount.email,
          password: roleAccount.password
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        console.log(`     ✅ Login: ${loginData.user.name}`);
        
        // Test access to different booking endpoints
        const endpointsToTest = [
          '/customer/bookings',
          '/staff/kasir/bookings',
          '/staff/manager/bookings'
        ];

        const accessResults = {};
        
        for (const endpoint of endpointsToTest) {
          try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
              method: 'GET',
              credentials: 'include'
            });

            if (response.ok) {
              const data = await response.json();
              accessResults[endpoint] = {
                canAccess: true,
                bookingCount: data.data?.length || 0,
                hasBookings: data.data && data.data.length > 0,
                isUserFiltered: endpoint === '/customer/bookings' && data.data?.length === 0
              };
              console.log(`     ✅ ${endpoint}: ${data.data?.length || 0} bookings`);
            } else {
              accessResults[endpoint] = {
                canAccess: false,
                status: response.status,
                error: await response.text()
              };
              console.log(`     ❌ ${endpoint}: HTTP ${response.status}`);
            }
          } catch (error) {
            accessResults[endpoint] = {
              canAccess: false,
              error: error.message
            };
            console.log(`     ❌ ${endpoint}: ${error.message}`);
          }
        }

        roleResults[roleAccount.role] = {
          loginSuccess: true,
          user: loginData.user,
          accessResults,
          canSeeBookings: Object.values(accessResults).some(r => r.canAccess && r.hasBookings),
          totalBookingsVisible: Math.max(...Object.values(accessResults)
            .filter(r => r.canAccess)
            .map(r => r.bookingCount || 0), 0)
        };

      } else {
        roleResults[roleAccount.role] = {
          loginSuccess: false,
          error: loginData.error
        };
        console.log(`     ❌ Login failed: ${loginData.error}`);
      }

    } catch (error) {
      roleResults[roleAccount.role] = {
        loginSuccess: false,
        error: error.message
      };
      console.error(`     ❌ ${roleAccount.name} test failed:`, error.message);
    }
  }

  return roleResults;
}

/**
 * Generate endpoint test summary
 */
function generateEndpointTestSummary(results) {
  console.log('\n📊 BACKEND ENDPOINT TEST SUMMARY');
  console.log('='.repeat(60));
  
  // Customer Data Status
  console.log('\n👤 CUSTOMER DATA STATUS:');
  if (results.customerData.dataAvailable) {
    console.log(`   ✅ Customer bookings: ${results.customerData.bookingCount} found`);
  } else {
    console.log(`   ❌ Customer bookings: No data available`);
  }
  
  // Staff Endpoints Status
  console.log('\n🌐 STAFF ENDPOINTS STATUS:');
  const workingEndpoints = Object.keys(results.staffEndpoints || {}).filter(ep => 
    results.staffEndpoints[ep].success
  );
  const bookingEndpoints = Object.keys(results.staffEndpoints || {}).filter(ep => 
    results.staffEndpoints[ep].success && results.staffEndpoints[ep].hasBookings
  );
  
  Object.entries(results.staffEndpoints || {}).forEach(([endpoint, data]) => {
    const status = data.success ? '✅' : '❌';
    const count = data.success ? `${data.dataCount} bookings` : data.error;
    console.log(`   ${status} ${data.name}: ${count}`);
  });
  
  console.log(`\n   📊 Summary: ${workingEndpoints.length} working, ${bookingEndpoints.length} with data`);
  
  // Role Access Status
  console.log('\n🔐 ROLE ACCESS STATUS:');
  Object.entries(results.roleAccess || {}).forEach(([role, data]) => {
    if (data.loginSuccess) {
      console.log(`   ✅ ${role}: Can see bookings: ${data.canSeeBookings ? 'YES' : 'NO'} (${data.totalBookingsVisible} max)`);
    } else {
      console.log(`   ❌ ${role}: Login failed`);
    }
  });
  
  // Issue Analysis
  console.log('\n🎯 ISSUE ANALYSIS:');
  const issues = [];
  
  if (!results.customerData.dataAvailable) {
    issues.push('No customer booking data exists');
  }
  
  if (workingEndpoints.length === 0) {
    issues.push('No staff endpoints working');
  } else if (bookingEndpoints.length === 0) {
    issues.push('Staff endpoints working but no booking data visible');
  }
  
  const staffCanSeeBookings = Object.values(results.roleAccess || {}).some(r => r.canSeeBookings);
  if (results.customerData.dataAvailable && !staffCanSeeBookings) {
    issues.push('Customer data exists but staff cannot see it (MAIN ISSUE)');
  }
  
  if (issues.length === 0) {
    console.log('   ✅ All endpoints working correctly!');
  } else {
    console.log('   🚨 Issues found:');
    issues.forEach((issue, index) => {
      console.log(`     ${index + 1}. ${issue}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (issues.includes('Customer data exists but staff cannot see it (MAIN ISSUE)')) {
    console.log('   1. 🚨 CRITICAL: Deploy staff booking endpoints to production');
    console.log('   2. Verify /staff/manager/bookings and /staff/kasir/bookings are available');
    console.log('   3. Test staff endpoints return ALL bookings, not user-filtered');
  } else if (!results.customerData.dataAvailable) {
    console.log('   1. Create test booking data first');
    console.log('   2. Verify customer booking creation works');
  } else if (workingEndpoints.length === 0) {
    console.log('   1. Check backend deployment status');
    console.log('   2. Verify staff routes are properly configured');
  } else {
    console.log('   ✅ System working correctly - no action needed');
  }

  return {
    customerDataExists: results.customerData.dataAvailable,
    workingEndpoints: workingEndpoints.length,
    bookingEndpoints: bookingEndpoints.length,
    staffCanSeeBookings,
    issues: issues.length,
    status: issues.length === 0 ? 'healthy' : 'issues_detected'
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testBackendBookingEndpoints = testBackendBookingEndpoints;
}

export default testBackendBookingEndpoints;
