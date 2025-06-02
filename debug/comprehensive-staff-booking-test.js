// debug/comprehensive-staff-booking-test.js
// Comprehensive test for all staff roles booking visibility

console.log('👥 Comprehensive Staff Booking Test Loaded');

/**
 * Test all staff roles for booking visibility
 */
async function testAllStaffRolesBookingVisibility() {
  console.log('👥 Starting Comprehensive Staff Roles Booking Visibility Test...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Define all staff accounts
  const staffAccounts = [
    { 
      email: 'kasir1@futsalapp.com', 
      password: 'password123', 
      role: 'staff_kasir',
      name: 'Kasir 1'
    },
    { 
      email: 'manajer1@futsalapp.com', 
      password: 'password123', 
      role: 'manajer_futsal',
      name: 'Manager 1'
    },
    { 
      email: 'pweb@futsalapp.com', 
      password: 'password123', 
      role: 'supervisor_sistem',
      name: 'Supervisor'
    }
  ];

  const results = {
    customerBooking: null,
    staffResults: {},
    endpointTests: {},
    summary: {}
  };

  try {
    // Step 1: Verify customer booking exists
    console.log('1️⃣ Verifying Customer Booking Exists...');
    results.customerBooking = await verifyCustomerBooking();
    
    if (!results.customerBooking.success) {
      console.log('❌ No customer booking found. Creating test booking...');
      results.customerBooking = await createTestCustomerBooking();
    }

    // Step 2: Test each staff role
    console.log('\n2️⃣ Testing Each Staff Role...');
    for (const account of staffAccounts) {
      console.log(`\n🔍 Testing ${account.role} (${account.name})...`);
      results.staffResults[account.role] = await testStaffRoleBookingAccess(account);
    }

    // Step 3: Test different endpoints for each role
    console.log('\n3️⃣ Testing Different Endpoints...');
    results.endpointTests = await testAllPossibleEndpoints();

    // Step 4: Generate comprehensive report
    console.log('\n4️⃣ Generating Comprehensive Report...');
    results.summary = generateComprehensiveReport(results);

    return results;

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return { error: error.message };
  }
}

/**
 * Verify customer booking exists
 */
async function verifyCustomerBooking() {
  const apiUrl = import.meta.env.VITE_API_URL;
  
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
    if (!loginData.success) {
      return { success: false, error: 'Customer login failed' };
    }

    // Get customer bookings
    const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
      method: 'GET',
      credentials: 'include'
    });

    const bookingsData = await bookingsResponse.json();
    
    if (bookingsData.success && bookingsData.data.length > 0) {
      console.log(`✅ Customer has ${bookingsData.data.length} booking(s)`);
      console.log(`   Latest booking: ID ${bookingsData.data[0].id}, Status: ${bookingsData.data[0].status}`);
      
      return {
        success: true,
        count: bookingsData.data.length,
        latestBooking: bookingsData.data[0]
      };
    } else {
      return { success: false, error: 'No customer bookings found' };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create test customer booking
 */
async function createTestCustomerBooking() {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    console.log('📝 Creating test customer booking...');
    
    // Login as customer first
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
    if (!loginData.success) {
      return { success: false, error: 'Customer login failed' };
    }

    // Create booking
    const bookingData = {
      field_id: 1,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      start_time: "15:00",
      end_time: "16:00",
      name: "Test Staff Visibility",
      phone: "081234567890",
      email: "test@customer.com",
      notes: "Test booking for staff visibility - " + new Date().toISOString()
    };

    const createResponse = await fetch(`${apiUrl}/customer/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bookingData)
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log(`✅ Test booking created: ID ${createResult.data.id}`);
      return {
        success: true,
        count: 1,
        latestBooking: createResult.data,
        created: true
      };
    } else {
      return { success: false, error: createResult.error || 'Booking creation failed' };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test staff role booking access
 */
async function testStaffRoleBookingAccess(account) {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // Login as staff
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: account.email,
        password: account.password
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      return {
        success: false,
        error: 'Login failed',
        loginError: loginData.error
      };
    }

    console.log(`   ✅ Login successful: ${loginData.user.name} (${loginData.user.role})`);

    // Test different endpoints based on role
    const endpointsToTest = getEndpointsForRole(account.role);
    const endpointResults = {};

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`   🔍 Testing ${endpoint}...`);
        
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          endpointResults[endpoint] = {
            success: true,
            status: response.status,
            dataCount: data.data?.length || 0,
            hasBookings: data.data && data.data.length > 0,
            sampleData: data.data?.slice(0, 1)
          };
          console.log(`     ✅ ${endpoint}: ${data.data?.length || 0} bookings`);
        } else {
          const errorText = await response.text();
          endpointResults[endpoint] = {
            success: false,
            status: response.status,
            error: errorText
          };
          console.log(`     ❌ ${endpoint}: HTTP ${response.status}`);
        }

      } catch (error) {
        endpointResults[endpoint] = {
          success: false,
          error: error.message
        };
        console.log(`     ❌ ${endpoint}: ${error.message}`);
      }
    }

    const workingEndpoints = Object.keys(endpointResults).filter(ep => endpointResults[ep].success);
    const totalBookings = Math.max(...Object.values(endpointResults)
      .filter(r => r.success)
      .map(r => r.dataCount || 0), 0);

    return {
      success: workingEndpoints.length > 0,
      user: loginData.user,
      workingEndpoints,
      totalBookings,
      endpointResults,
      canSeeBookings: totalBookings > 0
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get endpoints to test for each role
 */
function getEndpointsForRole(role) {
  const commonEndpoints = [
    '/customer/bookings', // Test if staff can access customer endpoint
  ];

  const roleSpecificEndpoints = {
    'staff_kasir': [
      '/staff/kasir/dashboard',
      '/staff/kasir/payments'
    ],
    'manajer_futsal': [
      '/staff/manager/dashboard',
      '/staff/manager/bookings', // Our new endpoint
      '/staff/manager/users'
    ],
    'supervisor_sistem': [
      '/staff/supervisor/dashboard',
      '/staff/supervisor/analytics'
    ]
  };

  return [...commonEndpoints, ...(roleSpecificEndpoints[role] || [])];
}

/**
 * Test all possible endpoints
 */
async function testAllPossibleEndpoints() {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Login as manager (highest access)
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
  if (!loginData.success) {
    return { error: 'Manager login failed for endpoint testing' };
  }

  const allEndpoints = [
    '/customer/bookings',
    '/staff/manager/bookings',
    '/staff/kasir/dashboard',
    '/staff/operator/dashboard',
    '/staff/manager/dashboard',
    '/staff/supervisor/dashboard',
    '/admin/bookings',
    '/admin/notifications',
    '/public/fields'
  ];

  const results = {};

  for (const endpoint of allEndpoints) {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        results[endpoint] = {
          success: true,
          status: response.status,
          dataCount: data.data?.length || 0
        };
      } else {
        results[endpoint] = {
          success: false,
          status: response.status
        };
      }
    } catch (error) {
      results[endpoint] = {
        success: false,
        error: error.message
      };
    }
  }

  return results;
}

/**
 * Generate comprehensive report
 */
function generateComprehensiveReport(results) {
  console.log('\n📊 COMPREHENSIVE STAFF BOOKING VISIBILITY REPORT');
  console.log('='.repeat(70));
  
  // Customer Booking Status
  console.log('\n👤 CUSTOMER BOOKING STATUS:');
  if (results.customerBooking?.success) {
    console.log(`   ✅ Customer has ${results.customerBooking.count} booking(s)`);
    if (results.customerBooking.created) {
      console.log('   📝 Test booking was created for this test');
    }
    console.log(`   📋 Latest booking ID: ${results.customerBooking.latestBooking?.id}`);
  } else {
    console.log('   ❌ No customer bookings available');
  }
  
  // Staff Access Results
  console.log('\n👥 STAFF ACCESS RESULTS:');
  Object.entries(results.staffResults).forEach(([role, data]) => {
    console.log(`\n   ${role.toUpperCase()}:`);
    if (data.success) {
      console.log(`     ✅ Login: Success (${data.user?.name})`);
      console.log(`     📊 Can see bookings: ${data.canSeeBookings ? 'YES' : 'NO'}`);
      console.log(`     📈 Total bookings visible: ${data.totalBookings}`);
      console.log(`     🔗 Working endpoints: ${data.workingEndpoints.join(', ')}`);
    } else {
      console.log(`     ❌ Login: Failed (${data.error})`);
    }
  });
  
  // Endpoint Analysis
  console.log('\n🌐 ENDPOINT ANALYSIS:');
  const workingEndpoints = Object.entries(results.endpointTests)
    .filter(([_, data]) => data.success);
  
  console.log(`   ✅ Working endpoints: ${workingEndpoints.length}`);
  workingEndpoints.forEach(([endpoint, data]) => {
    console.log(`     ${endpoint}: ${data.dataCount} items`);
  });
  
  // Summary
  const staffCanSeeBookings = Object.values(results.staffResults)
    .filter(r => r.success && r.canSeeBookings).length;
  const totalStaffTested = Object.keys(results.staffResults).length;
  
  console.log('\n🎯 SUMMARY:');
  console.log(`   Customer bookings available: ${results.customerBooking?.success ? 'YES' : 'NO'}`);
  console.log(`   Staff roles that can see bookings: ${staffCanSeeBookings}/${totalStaffTested}`);
  console.log(`   Issue status: ${staffCanSeeBookings === 0 ? 'CRITICAL - No staff can see bookings' : 
                                  staffCanSeeBookings < totalStaffTested ? 'PARTIAL - Some staff cannot see bookings' : 
                                  'RESOLVED - All staff can see bookings'}`);
  
  // Recommendations
  if (staffCanSeeBookings === 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Check if backend endpoints are properly deployed');
    console.log('   2. Verify role-based access control permissions');
    console.log('   3. Ensure staff booking endpoints return all bookings, not user-filtered');
    console.log('   4. Test authentication and session management');
  }

  return {
    customerBookingsAvailable: results.customerBooking?.success || false,
    staffCanSeeBookings,
    totalStaffTested,
    issueStatus: staffCanSeeBookings === 0 ? 'critical' : 
                 staffCanSeeBookings < totalStaffTested ? 'partial' : 'resolved',
    workingEndpointsCount: workingEndpoints.length
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testAllStaffRolesBookingVisibility = testAllStaffRolesBookingVisibility;
}

export default testAllStaffRolesBookingVisibility;
