// debug/final-integration-test.js
// Final comprehensive test for booking data integration

console.log('🎯 Final Integration Test Loaded');

/**
 * Final comprehensive test for booking data integration
 */
async function finalBookingIntegrationTest() {
  console.log('🎯 Starting Final Booking Data Integration Test...\n');

  const results = {
    setup: {},
    customerData: {},
    staffAccess: {},
    endpointValidation: {},
    integration: {},
    summary: {}
  };

  try {
    // Step 1: Setup and Environment Check
    console.log('1️⃣ Setup and Environment Check...');
    results.setup = await setupEnvironmentCheck();
    
    // Step 2: Customer Data Verification
    console.log('\n2️⃣ Customer Data Verification...');
    results.customerData = await verifyCustomerData();
    
    // Step 3: Staff Access Testing
    console.log('\n3️⃣ Staff Access Testing...');
    results.staffAccess = await testStaffAccess();
    
    // Step 4: Endpoint Validation
    console.log('\n4️⃣ Endpoint Validation...');
    results.endpointValidation = await validateEndpoints();
    
    // Step 5: Integration Analysis
    console.log('\n5️⃣ Integration Analysis...');
    results.integration = analyzeIntegration(results);
    
    // Step 6: Generate Final Summary
    console.log('\n6️⃣ Generating Final Summary...');
    results.summary = generateFinalSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Final integration test failed:', error);
    return { error: error.message };
  }
}

/**
 * Setup and environment check
 */
async function setupEnvironmentCheck() {
  console.log('🔧 Checking environment setup...');
  
  const setup = {
    frontendRunning: true,
    backendAccessible: false,
    apiUrl: import.meta.env.VITE_API_URL,
    environment: import.meta.env.VITE_NODE_ENV
  };

  try {
    // Check backend accessibility
    const healthResponse = await fetch(`${setup.apiUrl}/test/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      setup.backendAccessible = healthData.status === 'healthy';
      setup.backendStatus = healthData.status;
      setup.backendEnvironment = healthData.environment;
    }

    console.log(`   ✅ Frontend: Running`);
    console.log(`   ${setup.backendAccessible ? '✅' : '❌'} Backend: ${setup.backendStatus || 'Not accessible'}`);
    console.log(`   🌐 API URL: ${setup.apiUrl}`);
    console.log(`   🔧 Environment: ${setup.environment}`);

    return setup;

  } catch (error) {
    console.error('   ❌ Environment check failed:', error);
    return { ...setup, error: error.message };
  }
}

/**
 * Verify customer data exists
 */
async function verifyCustomerData() {
  console.log('👤 Verifying customer data...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const customerData = {
    loginSuccess: false,
    bookingCount: 0,
    bookingDetails: null,
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
      
      // Store user data for frontend API
      localStorage.setItem('user', JSON.stringify(loginData.user));
      
      // Get customer bookings
      const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });

      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        customerData.bookingCount = bookingsData.data.length;
        customerData.bookingDetails = bookingsData.data[0] || null;
        customerData.dataAvailable = bookingsData.data.length > 0;
        
        console.log(`   📊 Customer bookings: ${customerData.bookingCount}`);
        if (customerData.bookingDetails) {
          console.log(`   📋 Sample booking: ID ${customerData.bookingDetails.id}, Status: ${customerData.bookingDetails.status}`);
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
 * Test staff access to booking data
 */
async function testStaffAccess() {
  console.log('👥 Testing staff access...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const staffAccounts = [
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem' }
  ];

  const staffResults = {};

  for (const staff of staffAccounts) {
    try {
      console.log(`   🔍 Testing ${staff.role}: ${staff.email}...`);
      
      // Login as staff
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
        console.log(`     ✅ Login: ${loginData.user.name}`);
        
        // Store user data for frontend API testing
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        // Test role-specific endpoints
        const endpointsToTest = getRoleEndpoints(staff.role);
        const endpointResults = {};

        for (const endpoint of endpointsToTest) {
          try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
              method: 'GET',
              credentials: 'include'
            });

            if (response.ok) {
              const data = await response.json();
              endpointResults[endpoint] = {
                success: true,
                bookingCount: data.data?.length || 0,
                hasBookings: data.data && data.data.length > 0
              };
              console.log(`     ✅ ${endpoint}: ${data.data?.length || 0} bookings`);
            } else {
              endpointResults[endpoint] = {
                success: false,
                status: response.status
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

        staffResults[staff.role] = {
          loginSuccess: true,
          user: loginData.user,
          endpointResults,
          canSeeBookings: Object.values(endpointResults).some(r => r.success && r.hasBookings),
          maxBookingsVisible: Math.max(...Object.values(endpointResults)
            .filter(r => r.success)
            .map(r => r.bookingCount || 0), 0)
        };

      } else {
        staffResults[staff.role] = {
          loginSuccess: false,
          error: loginData.error
        };
        console.log(`     ❌ Login failed: ${loginData.error}`);
      }

    } catch (error) {
      staffResults[staff.role] = {
        loginSuccess: false,
        error: error.message
      };
      console.error(`     ❌ ${staff.role} test failed:`, error.message);
    }
  }

  return staffResults;
}

/**
 * Get role-specific endpoints to test
 */
function getRoleEndpoints(role) {
  const roleEndpoints = {
    'staff_kasir': ['/staff/kasir/bookings', '/customer/bookings'],
    'manajer_futsal': ['/staff/manager/bookings', '/staff/kasir/bookings', '/customer/bookings'],
    'supervisor_sistem': ['/staff/supervisor/bookings', '/staff/manager/bookings', '/staff/kasir/bookings', '/customer/bookings']
  };

  return roleEndpoints[role] || ['/customer/bookings'];
}

/**
 * Validate endpoints using frontend API
 */
async function validateEndpoints() {
  console.log('🌐 Validating endpoints using frontend API...');
  
  const validation = {
    frontendAPIWorking: false,
    endpointUsed: null,
    bookingCount: 0,
    metadata: null,
    error: null
  };

  try {
    // Import and test the frontend API
    const { getAllBookings } = await import('../src/api/bookingAPI.js');
    
    console.log('   🔍 Testing frontend getAllBookings API...');
    const result = await getAllBookings();
    
    if (result.success) {
      validation.frontendAPIWorking = true;
      validation.bookingCount = result.data?.length || 0;
      validation.metadata = result._metadata;
      validation.endpointUsed = result._metadata?.endpoint_used;
      
      console.log(`   ✅ Frontend API working: ${validation.bookingCount} bookings`);
      console.log(`   🎯 Endpoint used: ${validation.endpointUsed}`);
      console.log(`   📊 Role-specific: ${validation.metadata?.is_role_specific}`);
      console.log(`   ⚠️ Limited view: ${validation.metadata?.is_limited_view}`);
    }

  } catch (error) {
    validation.error = error.message;
    console.error('   ❌ Frontend API validation failed:', error.message);
  }

  return validation;
}

/**
 * Analyze overall integration
 */
function analyzeIntegration(results) {
  console.log('🔍 Analyzing overall integration...');
  
  const integration = {
    backendHealthy: results.setup?.backendAccessible || false,
    customerDataExists: results.customerData?.dataAvailable || false,
    staffCanLogin: Object.values(results.staffAccess || {}).some(r => r.loginSuccess),
    staffCanSeeBookings: Object.values(results.staffAccess || {}).some(r => r.canSeeBookings),
    frontendAPIWorking: results.endpointValidation?.frontendAPIWorking || false,
    dataSync: false,
    issues: [],
    status: 'unknown'
  };

  // Check data synchronization
  const customerBookings = results.customerData?.bookingCount || 0;
  const maxStaffBookings = Math.max(...Object.values(results.staffAccess || {})
    .map(r => r.maxBookingsVisible || 0), 0);
  
  integration.dataSync = customerBookings > 0 && maxStaffBookings > 0;

  // Identify issues
  if (!integration.backendHealthy) {
    integration.issues.push('Backend not accessible');
  }
  if (!integration.customerDataExists) {
    integration.issues.push('No customer booking data');
  }
  if (!integration.staffCanLogin) {
    integration.issues.push('Staff cannot login');
  }
  if (integration.customerDataExists && !integration.staffCanSeeBookings) {
    integration.issues.push('Staff cannot see customer bookings (MAIN ISSUE)');
  }
  if (!integration.frontendAPIWorking) {
    integration.issues.push('Frontend API not working');
  }

  // Determine status
  if (integration.issues.length === 0) {
    integration.status = 'fully_integrated';
  } else if (integration.issues.includes('Staff cannot see customer bookings (MAIN ISSUE)')) {
    integration.status = 'data_sync_issue';
  } else {
    integration.status = 'integration_failure';
  }

  console.log(`   📊 Integration status: ${integration.status}`);
  console.log(`   🚨 Issues found: ${integration.issues.length}`);

  return integration;
}

/**
 * Generate final summary
 */
function generateFinalSummary(results) {
  console.log('\n📊 FINAL BOOKING DATA INTEGRATION SUMMARY');
  console.log('='.repeat(70));
  
  // Environment Status
  console.log('\n🔧 ENVIRONMENT:');
  console.log(`   Frontend: ✅ Running`);
  console.log(`   Backend: ${results.setup?.backendAccessible ? '✅' : '❌'} ${results.setup?.backendStatus || 'Not accessible'}`);
  console.log(`   API URL: ${results.setup?.apiUrl}`);
  
  // Data Status
  console.log('\n📊 DATA STATUS:');
  console.log(`   Customer bookings: ${results.customerData?.dataAvailable ? '✅' : '❌'} ${results.customerData?.bookingCount || 0} found`);
  
  // Staff Access
  console.log('\n👥 STAFF ACCESS:');
  Object.entries(results.staffAccess || {}).forEach(([role, data]) => {
    if (data.loginSuccess) {
      console.log(`   ✅ ${role}: Login OK, Can see bookings: ${data.canSeeBookings ? 'YES' : 'NO'} (${data.maxBookingsVisible} max)`);
    } else {
      console.log(`   ❌ ${role}: Login failed`);
    }
  });
  
  // Frontend API
  console.log('\n🌐 FRONTEND API:');
  if (results.endpointValidation?.frontendAPIWorking) {
    console.log(`   ✅ API working: ${results.endpointValidation.bookingCount} bookings via ${results.endpointValidation.endpointUsed}`);
    console.log(`   📊 Limited view: ${results.endpointValidation.metadata?.is_limited_view ? 'YES' : 'NO'}`);
  } else {
    console.log(`   ❌ API not working: ${results.endpointValidation?.error}`);
  }
  
  // Integration Status
  console.log('\n🎯 INTEGRATION STATUS:');
  console.log(`   Overall: ${results.integration?.status?.toUpperCase()}`);
  
  if (results.integration?.issues?.length > 0) {
    console.log('   🚨 Issues:');
    results.integration.issues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.integration?.status === 'data_sync_issue') {
    console.log('   1. Deploy backend changes to production (kasir/manager booking endpoints)');
    console.log('   2. Verify role-based access control permissions');
    console.log('   3. Test staff booking endpoints return all bookings, not user-filtered');
  } else if (results.integration?.status === 'fully_integrated') {
    console.log('   ✅ All systems working correctly!');
  } else {
    console.log('   1. Fix backend connectivity issues');
    console.log('   2. Verify authentication system');
    console.log('   3. Check API endpoint implementations');
  }

  return {
    status: results.integration?.status,
    customerBookings: results.customerData?.bookingCount || 0,
    staffCanSeeBookings: results.integration?.staffCanSeeBookings || false,
    frontendAPIWorking: results.integration?.frontendAPIWorking || false,
    issueCount: results.integration?.issues?.length || 0
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.finalBookingIntegrationTest = finalBookingIntegrationTest;
}

export default finalBookingIntegrationTest;
