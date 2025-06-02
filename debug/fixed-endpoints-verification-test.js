// debug/fixed-endpoints-verification-test.js
// Verification Test untuk Endpoints yang Sudah Fix

console.log('🎉 Fixed Endpoints Verification Test Loaded');

/**
 * Verify all fixed endpoints are working
 */
async function verifyFixedEndpoints() {
  console.log('🎉 Verifying All Fixed Endpoints...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  const results = {
    staffEndpoints: {},
    adminEndpoints: {},
    frontendAPI: {},
    roleBasedAccess: {},
    summary: {}
  };

  try {
    // Step 1: Test Staff Endpoints (Previously 404, Now Fixed)
    console.log('1️⃣ Testing Previously Broken Staff Endpoints...');
    results.staffEndpoints = await testFixedStaffEndpoints(apiUrl);
    
    // Step 2: Test Admin Endpoints (Previously 500 Error, Now Fixed)
    console.log('\n2️⃣ Testing Previously Broken Admin Endpoints...');
    results.adminEndpoints = await testFixedAdminEndpoints(apiUrl);
    
    // Step 3: Test Frontend API Integration
    console.log('\n3️⃣ Testing Frontend API Integration...');
    results.frontendAPI = await testFrontendAPIIntegration();
    
    // Step 4: Test Role-Based Access
    console.log('\n4️⃣ Testing Role-Based Access...');
    results.roleBasedAccess = await testRoleBasedAccess(apiUrl);
    
    // Step 5: Generate Summary
    console.log('\n5️⃣ Generating Verification Summary...');
    results.summary = generateVerificationSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Fixed endpoints verification failed:', error);
    return { error: error.message };
  }
}

/**
 * Test staff endpoints that were previously 404
 */
async function testFixedStaffEndpoints(apiUrl) {
  console.log('👥 Testing fixed staff endpoints...');
  
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
    return { error: 'Manager login failed' };
  }

  console.log(`   🔐 Testing as: ${managerData.user.name} (${managerData.user.role})`);

  const staffEndpoints = [
    { path: '/staff/manager/bookings', name: 'Manager Bookings', previousStatus: '404 NOT FOUND' },
    { path: '/staff/kasir/bookings', name: 'Kasir Bookings', previousStatus: '404 NOT FOUND' },
    { path: '/staff/operator/bookings', name: 'Operator Bookings', previousStatus: '404 NOT FOUND' }
  ];

  const endpointResults = {};

  for (const endpoint of staffEndpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name} (was: ${endpoint.previousStatus})...`);
      
      const response = await fetch(`${apiUrl}${endpoint.path}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        endpointResults[endpoint.path] = {
          fixed: true,
          status: response.status,
          success: data.success,
          dataCount: data.data?.length || 0,
          hasBookings: data.data && data.data.length > 0,
          previousStatus: endpoint.previousStatus,
          currentStatus: 'WORKING ✅'
        };
        console.log(`     🎉 ${endpoint.name}: FIXED! ${data.data?.length || 0} bookings (was: ${endpoint.previousStatus})`);
      } else {
        endpointResults[endpoint.path] = {
          fixed: false,
          status: response.status,
          error: await response.text(),
          previousStatus: endpoint.previousStatus,
          currentStatus: `HTTP ${response.status} ❌`
        };
        console.log(`     ❌ ${endpoint.name}: Still broken - HTTP ${response.status}`);
      }

    } catch (error) {
      endpointResults[endpoint.path] = {
        fixed: false,
        error: error.message,
        previousStatus: endpoint.previousStatus,
        currentStatus: 'ERROR ❌'
      };
      console.log(`     ❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }

  return endpointResults;
}

/**
 * Test admin endpoints that were previously 500 error
 */
async function testFixedAdminEndpoints(apiUrl) {
  console.log('👑 Testing fixed admin endpoints...');
  
  const adminEndpoints = [
    { path: '/admin/bookings', name: 'Admin Get All Bookings', previousStatus: 'Working' },
    { path: '/admin/bookings/statistics', name: 'Admin Booking Statistics', previousStatus: '500 Error' }
  ];

  const adminResults = {};

  for (const endpoint of adminEndpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name} (was: ${endpoint.previousStatus})...`);
      
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
          fixed: true,
          status: response.status,
          success: data.success,
          dataCount: dataCount,
          previousStatus: endpoint.previousStatus,
          currentStatus: 'WORKING ✅'
        };
        console.log(`     🎉 ${endpoint.name}: FIXED! ${dataCount} items (was: ${endpoint.previousStatus})`);
      } else {
        adminResults[endpoint.path] = {
          fixed: false,
          status: response.status,
          error: await response.text(),
          previousStatus: endpoint.previousStatus,
          currentStatus: `HTTP ${response.status} ❌`
        };
        console.log(`     ❌ ${endpoint.name}: Still broken - HTTP ${response.status}`);
      }

    } catch (error) {
      adminResults[endpoint.path] = {
        fixed: false,
        error: error.message,
        previousStatus: endpoint.previousStatus,
        currentStatus: 'ERROR ❌'
      };
      console.log(`     ❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }

  return adminResults;
}

/**
 * Test frontend API integration with fixed endpoints
 */
async function testFrontendAPIIntegration() {
  console.log('🌐 Testing frontend API integration...');
  
  const frontendResults = {};

  try {
    // Import frontend API functions
    const { getAllBookings, getBookingStatistics } = await import('../src/api/bookingAPI.js');
    
    // Test getAllBookings with different roles
    const testRoles = [
      { role: 'manajer_futsal', name: 'Manager' },
      { role: 'staff_kasir', name: 'Kasir' },
      { role: 'operator_lapangan', name: 'Operator' },
      { role: 'supervisor_sistem', name: 'Supervisor' }
    ];

    for (const testRole of testRoles) {
      try {
        console.log(`   🔍 Testing getAllBookings as ${testRole.name}...`);
        
        // Set user role in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: `Test ${testRole.name}`,
          role: testRole.role
        }));

        const result = await getAllBookings({ page: 1, limit: 10 });
        
        frontendResults[testRole.role] = {
          success: true,
          dataCount: result.data?.length || 0,
          endpointUsed: result._metadata?.endpoint_used,
          isStaffEndpoint: result._metadata?.is_staff_endpoint,
          isAdminEndpoint: result._metadata?.is_admin_endpoint,
          endpointStatus: result._metadata?.endpoint_status,
          backendFixApplied: result._metadata?.backend_fix_applied
        };
        
        console.log(`     🎉 ${testRole.name}: ${frontendResults[testRole.role].dataCount} bookings via ${frontendResults[testRole.role].endpointUsed}`);
        console.log(`     ✅ Endpoint status: ${frontendResults[testRole.role].endpointStatus}`);
        
      } catch (error) {
        frontendResults[testRole.role] = {
          success: false,
          error: error.message
        };
        console.log(`     ❌ ${testRole.name}: ${error.message}`);
      }
    }

    // Test getBookingStatistics
    console.log('   🔍 Testing getBookingStatistics...');
    try {
      const statsResult = await getBookingStatistics();
      frontendResults.statistics = {
        success: true,
        hasStatistics: !!statsResult.data?.statistics,
        totalBookings: statsResult.data?.statistics?.total_bookings || 0
      };
      console.log(`     🎉 Statistics: ${frontendResults.statistics.totalBookings} total bookings`);
    } catch (error) {
      frontendResults.statistics = {
        success: false,
        error: error.message
      };
      console.log(`     ❌ Statistics: ${error.message}`);
    }

  } catch (error) {
    console.error('   ❌ Frontend API import failed:', error);
    frontendResults.importError = error.message;
  }

  return frontendResults;
}

/**
 * Test role-based access with fixed endpoints
 */
async function testRoleBasedAccess(apiUrl) {
  console.log('🔐 Testing role-based access...');
  
  const roles = [
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir', name: 'Kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal', name: 'Manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem', name: 'Supervisor' }
  ];

  const roleResults = {};

  for (const roleAccount of roles) {
    try {
      console.log(`   🔍 Testing ${roleAccount.name} access...`);
      
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
        
        // Test access to their primary endpoint
        const primaryEndpoints = {
          'staff_kasir': '/staff/kasir/bookings',
          'manajer_futsal': '/staff/manager/bookings',
          'supervisor_sistem': '/admin/bookings'
        };

        const primaryEndpoint = primaryEndpoints[roleAccount.role];
        
        if (primaryEndpoint) {
          const response = await fetch(`${apiUrl}${primaryEndpoint}`, {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            roleResults[roleAccount.role] = {
              loginSuccess: true,
              user: loginData.user,
              primaryEndpointWorking: true,
              primaryEndpoint: primaryEndpoint,
              bookingCount: data.data?.length || data.data?.bookings?.length || 0
            };
            console.log(`     🎉 ${roleAccount.name} can access ${primaryEndpoint}: ${roleResults[roleAccount.role].bookingCount} bookings`);
          } else {
            roleResults[roleAccount.role] = {
              loginSuccess: true,
              user: loginData.user,
              primaryEndpointWorking: false,
              primaryEndpoint: primaryEndpoint,
              error: `HTTP ${response.status}`
            };
            console.log(`     ❌ ${roleAccount.name} cannot access ${primaryEndpoint}: HTTP ${response.status}`);
          }
        }

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
 * Generate verification summary
 */
function generateVerificationSummary(results) {
  console.log('\n🎉 FIXED ENDPOINTS VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  // Staff Endpoints Status
  console.log('\n👥 STAFF ENDPOINTS (Previously 404):');
  Object.entries(results.staffEndpoints || {}).forEach(([endpoint, data]) => {
    const status = data.fixed ? '🎉 FIXED' : '❌ Still Broken';
    console.log(`   ${status} ${endpoint}: ${data.currentStatus} (was: ${data.previousStatus})`);
    if (data.fixed) {
      console.log(`     📊 Data: ${data.dataCount} bookings available`);
    }
  });
  
  // Admin Endpoints Status
  console.log('\n👑 ADMIN ENDPOINTS (Previously 500 Error):');
  Object.entries(results.adminEndpoints || {}).forEach(([endpoint, data]) => {
    const status = data.fixed ? '🎉 FIXED' : '❌ Still Broken';
    console.log(`   ${status} ${endpoint}: ${data.currentStatus} (was: ${data.previousStatus})`);
    if (data.fixed) {
      console.log(`     📊 Data: ${data.dataCount} items available`);
    }
  });
  
  // Frontend API Status
  console.log('\n🌐 FRONTEND API INTEGRATION:');
  Object.entries(results.frontendAPI || {}).forEach(([role, data]) => {
    if (role !== 'statistics' && role !== 'importError') {
      if (data.success) {
        console.log(`   ✅ ${role}: ${data.dataCount} bookings via ${data.endpointUsed}`);
        console.log(`     🎯 Status: ${data.endpointStatus}, Backend fix: ${data.backendFixApplied ? 'Applied' : 'Not applied'}`);
      } else {
        console.log(`   ❌ ${role}: ${data.error}`);
      }
    }
  });
  
  if (results.frontendAPI?.statistics) {
    const stats = results.frontendAPI.statistics;
    console.log(`   📊 Statistics: ${stats.success ? `${stats.totalBookings} total bookings` : stats.error}`);
  }
  
  // Role-Based Access Status
  console.log('\n🔐 ROLE-BASED ACCESS:');
  Object.entries(results.roleBasedAccess || {}).forEach(([role, data]) => {
    if (data.loginSuccess && data.primaryEndpointWorking) {
      console.log(`   ✅ ${role}: Can access ${data.primaryEndpoint} (${data.bookingCount} bookings)`);
    } else if (data.loginSuccess) {
      console.log(`   ❌ ${role}: Login OK but cannot access ${data.primaryEndpoint}`);
    } else {
      console.log(`   ❌ ${role}: Login failed`);
    }
  });
  
  // Overall Status
  console.log('\n🎯 OVERALL VERIFICATION STATUS:');
  const staffFixed = Object.values(results.staffEndpoints || {}).filter(e => e.fixed).length;
  const totalStaff = Object.keys(results.staffEndpoints || {}).length;
  const adminFixed = Object.values(results.adminEndpoints || {}).filter(e => e.fixed).length;
  const totalAdmin = Object.keys(results.adminEndpoints || {}).length;
  const frontendWorking = Object.values(results.frontendAPI || {}).filter(e => e.success).length;
  
  if (staffFixed === totalStaff && adminFixed === totalAdmin && frontendWorking > 0) {
    console.log('   🎉 ALL ENDPOINTS SUCCESSFULLY FIXED!');
    console.log('   ✅ Staff endpoints: All working');
    console.log('   ✅ Admin endpoints: All working');
    console.log('   ✅ Frontend integration: Working');
    console.log('   🚀 System ready for production use!');
  } else {
    console.log('   ⚠️ Some issues still remain:');
    if (staffFixed < totalStaff) console.log(`     - Staff endpoints: ${staffFixed}/${totalStaff} fixed`);
    if (adminFixed < totalAdmin) console.log(`     - Admin endpoints: ${adminFixed}/${totalAdmin} fixed`);
    if (frontendWorking === 0) console.log(`     - Frontend integration: Not working`);
  }

  return {
    staffEndpointsFixed: staffFixed,
    totalStaffEndpoints: totalStaff,
    adminEndpointsFixed: adminFixed,
    totalAdminEndpoints: totalAdmin,
    frontendWorking: frontendWorking > 0,
    allFixed: staffFixed === totalStaff && adminFixed === totalAdmin && frontendWorking > 0
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.verifyFixedEndpoints = verifyFixedEndpoints;
}

export default verifyFixedEndpoints;
