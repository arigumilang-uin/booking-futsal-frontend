// debug/admin-booking-endpoint-test.js
// Test Admin Booking Endpoints yang Baru

console.log('👑 Admin Booking Endpoint Test Loaded');

/**
 * Test admin booking endpoints yang baru ditambahkan
 */
async function testAdminBookingEndpoints() {
  console.log('👑 Testing Admin Booking Endpoints...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  const results = {
    authentication: {},
    adminEndpoints: {},
    frontendAPI: {},
    dataComparison: {},
    summary: {}
  };

  try {
    // Step 1: Authentication Test
    console.log('1️⃣ Testing Admin Authentication...');
    results.authentication = await testAdminAuthentication(apiUrl);
    
    // Step 2: Admin Endpoints Test
    console.log('\n2️⃣ Testing Admin Booking Endpoints...');
    results.adminEndpoints = await testAdminEndpoints(apiUrl);
    
    // Step 3: Frontend API Test
    console.log('\n3️⃣ Testing Frontend API Integration...');
    results.frontendAPI = await testFrontendAPIIntegration();
    
    // Step 4: Data Comparison
    console.log('\n4️⃣ Comparing Data Sources...');
    results.dataComparison = compareDataSources(results);
    
    // Step 5: Generate Summary
    console.log('\n5️⃣ Generating Test Summary...');
    results.summary = generateAdminTestSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Admin booking endpoint test failed:', error);
    return { error: error.message };
  }
}

/**
 * Test admin authentication
 */
async function testAdminAuthentication(apiUrl) {
  console.log('🔐 Testing admin authentication...');
  
  const adminRoles = [
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal', name: 'Manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem', name: 'Supervisor' }
  ];

  const authResults = {};

  for (const admin of adminRoles) {
    try {
      console.log(`   🔍 Testing ${admin.name} (${admin.role})...`);
      
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: admin.email,
          password: admin.password
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        authResults[admin.role] = {
          loginSuccess: true,
          user: loginData.user,
          hasManagementAccess: ['manajer_futsal', 'supervisor_sistem'].includes(loginData.user.role)
        };
        
        console.log(`     ✅ ${admin.name} login: ${loginData.user.name}`);
        console.log(`     👑 Management access: ${authResults[admin.role].hasManagementAccess ? 'YES' : 'NO'}`);
        
        // Store user for frontend API testing
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
      } else {
        authResults[admin.role] = {
          loginSuccess: false,
          error: loginData.error
        };
        console.log(`     ❌ ${admin.name} login failed: ${loginData.error}`);
      }

    } catch (error) {
      authResults[admin.role] = {
        loginSuccess: false,
        error: error.message
      };
      console.error(`     ❌ ${admin.name} test failed:`, error.message);
    }
  }

  return authResults;
}

/**
 * Test admin booking endpoints
 */
async function testAdminEndpoints(apiUrl) {
  console.log('👑 Testing admin booking endpoints...');
  
  const endpoints = [
    { path: '/admin/bookings', method: 'GET', name: 'Get All Bookings', params: { page: 1, limit: 10 } },
    { path: '/admin/bookings/statistics', method: 'GET', name: 'Get Statistics', params: {} }
  ];

  const endpointResults = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.name}: ${endpoint.path}...`);
      
      const url = new URL(`${apiUrl}${endpoint.path}`);
      Object.keys(endpoint.params).forEach(key => {
        if (endpoint.params[key]) {
          url.searchParams.append(key, endpoint.params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: endpoint.method,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          endpointResults[endpoint.path] = {
            success: true,
            status: response.status,
            dataStructure: analyzeDataStructure(data, endpoint.path),
            sampleData: getSampleData(data, endpoint.path)
          };
          
          console.log(`     ✅ ${endpoint.name}: Success`);
          console.log(`     📊 Data structure: ${endpointResults[endpoint.path].dataStructure.type}`);
          console.log(`     📋 Sample count: ${endpointResults[endpoint.path].dataStructure.count}`);
          
        } else {
          endpointResults[endpoint.path] = {
            success: false,
            error: data.error,
            status: response.status
          };
          console.log(`     ❌ ${endpoint.name}: ${data.error}`);
        }
        
      } else {
        const errorText = await response.text();
        endpointResults[endpoint.path] = {
          success: false,
          status: response.status,
          error: errorText
        };
        console.log(`     ❌ ${endpoint.name}: HTTP ${response.status}`);
      }

    } catch (error) {
      endpointResults[endpoint.path] = {
        success: false,
        error: error.message
      };
      console.log(`     ❌ ${endpoint.name}: ${error.message}`);
    }
  }

  return endpointResults;
}

/**
 * Test frontend API integration
 */
async function testFrontendAPIIntegration() {
  console.log('🌐 Testing frontend API integration...');
  
  const frontendResults = {};

  try {
    // Import frontend API functions
    const { getAllBookings, getAdminBookings, getBookingStatistics } = await import('../src/api/bookingAPI.js');
    
    // Test getAllBookings (should use admin endpoint for management roles)
    console.log('   🔍 Testing getAllBookings...');
    try {
      const allBookingsResult = await getAllBookings({ page: 1, limit: 10 });
      frontendResults.getAllBookings = {
        success: true,
        dataCount: allBookingsResult.data?.length || 0,
        endpointUsed: allBookingsResult._metadata?.endpoint_used,
        isAdminEndpoint: allBookingsResult._metadata?.is_admin_endpoint
      };
      
      console.log(`     ✅ getAllBookings: ${frontendResults.getAllBookings.dataCount} bookings`);
      console.log(`     🎯 Endpoint used: ${frontendResults.getAllBookings.endpointUsed}`);
      console.log(`     👑 Admin endpoint: ${frontendResults.getAllBookings.isAdminEndpoint ? 'YES' : 'NO'}`);
      
    } catch (error) {
      frontendResults.getAllBookings = {
        success: false,
        error: error.message
      };
      console.log(`     ❌ getAllBookings: ${error.message}`);
    }

    // Test getAdminBookings (direct admin endpoint)
    console.log('   🔍 Testing getAdminBookings...');
    try {
      const adminBookingsResult = await getAdminBookings({ page: 1, limit: 10 });
      frontendResults.getAdminBookings = {
        success: true,
        dataCount: adminBookingsResult.data?.length || 0,
        endpointUsed: adminBookingsResult._metadata?.endpoint_used,
        isAdminEndpoint: adminBookingsResult._metadata?.is_admin_endpoint
      };
      
      console.log(`     ✅ getAdminBookings: ${frontendResults.getAdminBookings.dataCount} bookings`);
      console.log(`     🎯 Endpoint used: ${frontendResults.getAdminBookings.endpointUsed}`);
      
    } catch (error) {
      frontendResults.getAdminBookings = {
        success: false,
        error: error.message
      };
      console.log(`     ❌ getAdminBookings: ${error.message}`);
    }

    // Test getBookingStatistics
    console.log('   🔍 Testing getBookingStatistics...');
    try {
      const statsResult = await getBookingStatistics();
      frontendResults.getBookingStatistics = {
        success: true,
        hasStatistics: !!statsResult.data?.statistics,
        totalBookings: statsResult.data?.statistics?.total_bookings || 0
      };
      
      console.log(`     ✅ getBookingStatistics: ${frontendResults.getBookingStatistics.totalBookings} total bookings`);
      
    } catch (error) {
      frontendResults.getBookingStatistics = {
        success: false,
        error: error.message
      };
      console.log(`     ❌ getBookingStatistics: ${error.message}`);
    }

  } catch (error) {
    console.error('   ❌ Frontend API import failed:', error);
    frontendResults.importError = error.message;
  }

  return frontendResults;
}

/**
 * Analyze data structure
 */
function analyzeDataStructure(data, endpoint) {
  if (endpoint === '/admin/bookings') {
    return {
      type: 'admin_bookings',
      count: data.data?.bookings?.length || 0,
      hasPagination: !!data.data?.pagination,
      hasFilters: !!data.data?.filters
    };
  } else if (endpoint === '/admin/bookings/statistics') {
    return {
      type: 'statistics',
      count: data.data?.statistics?.total_bookings || 0,
      hasStatistics: !!data.data?.statistics
    };
  }
  
  return {
    type: 'unknown',
    count: 0
  };
}

/**
 * Get sample data
 */
function getSampleData(data, endpoint) {
  if (endpoint === '/admin/bookings') {
    return data.data?.bookings?.slice(0, 1) || [];
  } else if (endpoint === '/admin/bookings/statistics') {
    return data.data?.statistics || {};
  }
  
  return null;
}

/**
 * Compare data sources
 */
function compareDataSources(results) {
  console.log('🔍 Comparing data sources...');
  
  const comparison = {
    adminEndpointWorking: results.adminEndpoints?.['/admin/bookings']?.success || false,
    frontendAPIWorking: results.frontendAPI?.getAllBookings?.success || false,
    dataConsistency: false,
    issues: []
  };

  // Check data consistency
  const adminCount = results.adminEndpoints?.['/admin/bookings']?.dataStructure?.count || 0;
  const frontendCount = results.frontendAPI?.getAllBookings?.dataCount || 0;
  
  comparison.dataConsistency = adminCount === frontendCount && adminCount > 0;
  
  if (!comparison.adminEndpointWorking) {
    comparison.issues.push('Admin endpoint not working');
  }
  
  if (!comparison.frontendAPIWorking) {
    comparison.issues.push('Frontend API not working');
  }
  
  if (comparison.adminEndpointWorking && comparison.frontendAPIWorking && !comparison.dataConsistency) {
    comparison.issues.push('Data count mismatch between admin endpoint and frontend API');
  }

  console.log(`   📊 Admin endpoint: ${comparison.adminEndpointWorking ? 'Working' : 'Failed'}`);
  console.log(`   🌐 Frontend API: ${comparison.frontendAPIWorking ? 'Working' : 'Failed'}`);
  console.log(`   🔄 Data consistency: ${comparison.dataConsistency ? 'Consistent' : 'Inconsistent'}`);

  return comparison;
}

/**
 * Generate admin test summary
 */
function generateAdminTestSummary(results) {
  console.log('\n📊 ADMIN BOOKING ENDPOINT TEST SUMMARY');
  console.log('='.repeat(70));
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION STATUS:');
  Object.entries(results.authentication || {}).forEach(([role, data]) => {
    if (data.loginSuccess) {
      console.log(`   ✅ ${role}: ${data.user?.name} (Management: ${data.hasManagementAccess ? 'YES' : 'NO'})`);
    } else {
      console.log(`   ❌ ${role}: Login failed`);
    }
  });
  
  // Admin Endpoints Status
  console.log('\n👑 ADMIN ENDPOINTS STATUS:');
  Object.entries(results.adminEndpoints || {}).forEach(([endpoint, data]) => {
    if (data.success) {
      console.log(`   ✅ ${endpoint}: ${data.dataStructure?.count || 0} items`);
    } else {
      console.log(`   ❌ ${endpoint}: ${data.error}`);
    }
  });
  
  // Frontend API Status
  console.log('\n🌐 FRONTEND API STATUS:');
  Object.entries(results.frontendAPI || {}).forEach(([api, data]) => {
    if (data.success) {
      console.log(`   ✅ ${api}: ${data.dataCount || 0} items (${data.endpointUsed || 'unknown endpoint'})`);
    } else {
      console.log(`   ❌ ${api}: ${data.error}`);
    }
  });
  
  // Overall Status
  console.log('\n🎯 OVERALL STATUS:');
  const adminWorking = Object.values(results.adminEndpoints || {}).some(e => e.success);
  const frontendWorking = Object.values(results.frontendAPI || {}).some(e => e.success);
  const authWorking = Object.values(results.authentication || {}).some(e => e.loginSuccess);
  
  if (adminWorking && frontendWorking && authWorking) {
    console.log('   ✅ ALL SYSTEMS WORKING - Admin booking endpoints successfully integrated!');
  } else {
    console.log('   ❌ ISSUES DETECTED:');
    if (!authWorking) console.log('     - Authentication issues');
    if (!adminWorking) console.log('     - Admin endpoints not working');
    if (!frontendWorking) console.log('     - Frontend API integration issues');
  }

  return {
    authWorking,
    adminWorking,
    frontendWorking,
    overallStatus: adminWorking && frontendWorking && authWorking ? 'success' : 'issues'
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testAdminBookingEndpoints = testAdminBookingEndpoints;
}

export default testAdminBookingEndpoints;
