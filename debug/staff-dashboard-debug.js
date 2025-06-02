// debug/staff-dashboard-debug.js
// Comprehensive Staff Dashboard Visibility Debug

console.log('👨‍💼 Staff Dashboard Debug Script Loaded');

/**
 * Comprehensive debug for staff dashboard booking visibility
 */
async function debugStaffDashboardVisibility() {
  console.log('👨‍💼 Starting Staff Dashboard Visibility Debug...\n');

  const results = {
    authentication: {},
    endpoints: {},
    permissions: {},
    dataSync: {},
    solutions: []
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    // Step 1: Test Staff Authentication Methods
    console.log('1️⃣ Testing Staff Authentication Methods...');
    results.authentication = await testStaffAuthentication();
    
    // Step 2: Test API Endpoints Access
    console.log('\n2️⃣ Testing API Endpoints Access...');
    results.endpoints = await testStaffEndpoints();
    
    // Step 3: Test Role Permissions
    console.log('\n3️⃣ Testing Role Permissions...');
    results.permissions = await testRolePermissions();
    
    // Step 4: Test Data Synchronization
    console.log('\n4️⃣ Testing Data Synchronization...');
    results.dataSync = await testDataSynchronization();
    
    // Step 5: Generate Solutions
    console.log('\n5️⃣ Generating Solutions...');
    results.solutions = generateSolutions(results);
    
    // Step 6: Generate Report
    console.log('\n📊 Generating Debug Report...');
    generateDebugReport(results);
    
    return results;

  } catch (error) {
    console.error('❌ Staff dashboard debug failed:', error);
    return { error: error.message };
  }
}

/**
 * Test different authentication methods for staff
 */
async function testStaffAuthentication() {
  console.log('🔐 Testing Staff Authentication Methods...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const staffAccounts = [
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal' },
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem' }
  ];

  const authResults = {};

  for (const account of staffAccounts) {
    console.log(`🔐 Testing ${account.role}: ${account.email}`);
    
    try {
      // Method 1: Cookie-based authentication
      const cookieResult = await testCookieAuth(account);
      
      // Method 2: Token-based authentication (if available)
      const tokenResult = await testTokenAuth(account);
      
      authResults[account.role] = {
        email: account.email,
        cookieAuth: cookieResult,
        tokenAuth: tokenResult,
        workingMethod: cookieResult.success ? 'cookie' : (tokenResult.success ? 'token' : 'none')
      };

      console.log(`   ${cookieResult.success ? '✅' : '❌'} Cookie Auth: ${cookieResult.success ? 'Working' : cookieResult.error}`);
      console.log(`   ${tokenResult.success ? '✅' : '❌'} Token Auth: ${tokenResult.success ? 'Working' : tokenResult.error}`);

    } catch (error) {
      console.error(`   ❌ ${account.role} auth test failed:`, error.message);
      authResults[account.role] = {
        email: account.email,
        error: error.message,
        workingMethod: 'none'
      };
    }
  }

  const workingAccounts = Object.values(authResults).filter(r => r.workingMethod !== 'none').length;
  console.log(`📊 Authentication Summary: ${workingAccounts}/${staffAccounts.length} staff accounts can authenticate`);

  return {
    success: workingAccounts > 0,
    results: authResults,
    workingAccounts,
    totalAccounts: staffAccounts.length
  };
}

/**
 * Test cookie-based authentication
 */
async function testCookieAuth(account) {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // Login with cookies
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
      return { success: false, error: loginData.error || 'Login failed' };
    }

    // Test authenticated request
    const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
      method: 'GET',
      credentials: 'include'
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      return {
        success: true,
        user: profileData.user,
        method: 'cookie'
      };
    } else {
      return { success: false, error: `Profile fetch failed: HTTP ${profileResponse.status}` };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test token-based authentication
 */
async function testTokenAuth(account) {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // First login to get cookie
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
      return { success: false, error: 'Login failed' };
    }

    // Try to get token from refresh endpoint
    const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!refreshResponse.ok) {
      return { success: false, error: 'Refresh endpoint not available' };
    }

    const refreshData = await refreshResponse.json();
    const token = refreshData.token;

    if (!token) {
      return { success: false, error: 'No token in refresh response' };
    }

    // Test with token
    const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      return {
        success: true,
        user: profileData.user,
        token: token,
        method: 'token'
      };
    } else {
      return { success: false, error: `Token auth failed: HTTP ${profileResponse.status}` };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test staff endpoints access
 */
async function testStaffEndpoints() {
  console.log('🌐 Testing Staff Endpoints Access...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const endpoints = [
    '/admin/bookings',
    '/staff/bookings', 
    '/staff/kasir/dashboard',
    '/staff/manager/dashboard',
    '/customer/bookings' // Test if staff can access customer endpoint
  ];

  // Get working authentication from previous test
  const authResult = await testCookieAuth({
    email: 'manajer1@futsalapp.com',
    password: 'password123'
  });

  if (!authResult.success) {
    return { success: false, error: 'Cannot authenticate for endpoint testing' };
  }

  const endpointResults = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Testing ${endpoint}...`);
      
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
          hasData: !!data.data,
          sampleData: data.data?.slice(0, 1) // First item for inspection
        };
        console.log(`   ✅ ${endpoint}: ${data.data?.length || 0} items`);
      } else {
        const errorText = await response.text();
        endpointResults[endpoint] = {
          success: false,
          status: response.status,
          error: errorText
        };
        console.log(`   ❌ ${endpoint}: HTTP ${response.status}`);
      }

    } catch (error) {
      endpointResults[endpoint] = {
        success: false,
        error: error.message
      };
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }

  const workingEndpoints = Object.keys(endpointResults).filter(ep => endpointResults[ep].success);
  console.log(`📊 Endpoints Summary: ${workingEndpoints.length}/${endpoints.length} endpoints accessible`);

  return {
    success: workingEndpoints.length > 0,
    results: endpointResults,
    workingEndpoints,
    totalEndpoints: endpoints.length
  };
}

/**
 * Test role permissions
 */
async function testRolePermissions() {
  console.log('🔒 Testing Role Permissions...');
  
  const roles = ['manajer_futsal', 'staff_kasir', 'supervisor_sistem'];
  const permissionResults = {};

  for (const role of roles) {
    const account = {
      'manajer_futsal': { email: 'manajer1@futsalapp.com', password: 'password123' },
      'staff_kasir': { email: 'kasir1@futsalapp.com', password: 'password123' },
      'supervisor_sistem': { email: 'pweb@futsalapp.com', password: 'password123' }
    }[role];

    console.log(`🔒 Testing ${role} permissions...`);

    try {
      const authResult = await testCookieAuth(account);
      
      if (authResult.success) {
        const endpointTest = await testSingleEndpoint('/admin/bookings', 'cookie');
        permissionResults[role] = {
          canAuthenticate: true,
          canAccessAdminBookings: endpointTest.success,
          bookingCount: endpointTest.dataCount || 0,
          user: authResult.user
        };
        console.log(`   ✅ ${role}: Can access admin bookings: ${endpointTest.success}`);
      } else {
        permissionResults[role] = {
          canAuthenticate: false,
          error: authResult.error
        };
        console.log(`   ❌ ${role}: Cannot authenticate`);
      }

    } catch (error) {
      permissionResults[role] = {
        canAuthenticate: false,
        error: error.message
      };
      console.log(`   ❌ ${role}: ${error.message}`);
    }
  }

  return {
    success: Object.values(permissionResults).some(r => r.canAccessAdminBookings),
    results: permissionResults
  };
}

/**
 * Test single endpoint
 */
async function testSingleEndpoint(endpoint, authMethod = 'cookie') {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        dataCount: data.data?.length || 0,
        data: data.data
      };
    } else {
      return {
        success: false,
        status: response.status,
        error: await response.text()
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test data synchronization
 */
async function testDataSynchronization() {
  console.log('🔄 Testing Data Synchronization...');
  
  try {
    // Step 1: Get customer bookings count
    const customerAuth = await testCookieAuth({
      email: 'ari@gmail.com',
      password: 'password123'
    });

    let customerBookings = 0;
    if (customerAuth.success) {
      const customerData = await testSingleEndpoint('/customer/bookings');
      customerBookings = customerData.dataCount || 0;
      console.log(`👤 Customer can see ${customerBookings} bookings`);
    }

    // Step 2: Get staff bookings count
    const staffAuth = await testCookieAuth({
      email: 'manajer1@futsalapp.com',
      password: 'password123'
    });

    let staffBookings = 0;
    if (staffAuth.success) {
      const staffData = await testSingleEndpoint('/admin/bookings');
      staffBookings = staffData.dataCount || 0;
      console.log(`👨‍💼 Staff can see ${staffBookings} bookings`);
    }

    // Step 3: Compare data
    const syncStatus = customerBookings <= staffBookings ? 'synchronized' : 'out_of_sync';
    console.log(`🔄 Sync Status: ${syncStatus}`);
    console.log(`📊 Customer: ${customerBookings}, Staff: ${staffBookings}`);

    return {
      success: true,
      customerBookings,
      staffBookings,
      syncStatus,
      dataDifference: staffBookings - customerBookings
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate solutions based on test results
 */
function generateSolutions(results) {
  const solutions = [];

  // Authentication solutions
  if (!results.authentication.success) {
    solutions.push({
      issue: 'Staff Authentication Failed',
      solution: 'Fix authentication method - use cookie-based auth or implement token refresh',
      priority: 'HIGH'
    });
  }

  // Endpoint solutions
  if (!results.endpoints.success) {
    solutions.push({
      issue: 'Staff Cannot Access Booking Endpoints',
      solution: 'Verify /admin/bookings endpoint and role permissions',
      priority: 'HIGH'
    });
  }

  // Permission solutions
  if (!results.permissions.success) {
    solutions.push({
      issue: 'Role Permission Issues',
      solution: 'Check role-based access control for admin endpoints',
      priority: 'MEDIUM'
    });
  }

  // Sync solutions
  if (results.dataSync.syncStatus === 'out_of_sync') {
    solutions.push({
      issue: 'Data Not Synchronized',
      solution: 'Check data filtering and ensure staff can see all customer bookings',
      priority: 'HIGH'
    });
  }

  return solutions;
}

/**
 * Generate comprehensive debug report
 */
function generateDebugReport(results) {
  console.log('\n📊 STAFF DASHBOARD VISIBILITY DEBUG REPORT');
  console.log('='.repeat(60));
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION STATUS:');
  if (results.authentication.success) {
    console.log(`   ✅ ${results.authentication.workingAccounts}/${results.authentication.totalAccounts} staff accounts can authenticate`);
    Object.entries(results.authentication.results).forEach(([role, data]) => {
      console.log(`   ${data.workingMethod !== 'none' ? '✅' : '❌'} ${role}: ${data.workingMethod}`);
    });
  } else {
    console.log('   ❌ Staff authentication failed');
  }
  
  // Endpoints Status
  console.log('\n🌐 ENDPOINTS ACCESS STATUS:');
  if (results.endpoints.success) {
    console.log(`   ✅ ${results.endpoints.workingEndpoints.length}/${results.endpoints.totalEndpoints} endpoints accessible`);
    results.endpoints.workingEndpoints.forEach(ep => {
      const data = results.endpoints.results[ep];
      console.log(`   ✅ ${ep}: ${data.dataCount} items`);
    });
  } else {
    console.log('   ❌ No endpoints accessible');
  }
  
  // Permissions Status
  console.log('\n🔒 ROLE PERMISSIONS STATUS:');
  if (results.permissions.success) {
    Object.entries(results.permissions.results).forEach(([role, data]) => {
      console.log(`   ${data.canAccessAdminBookings ? '✅' : '❌'} ${role}: Admin bookings access ${data.canAccessAdminBookings ? 'granted' : 'denied'}`);
    });
  } else {
    console.log('   ❌ No roles can access admin bookings');
  }
  
  // Data Sync Status
  console.log('\n🔄 DATA SYNCHRONIZATION STATUS:');
  if (results.dataSync.success) {
    console.log(`   Status: ${results.dataSync.syncStatus}`);
    console.log(`   Customer Bookings: ${results.dataSync.customerBookings}`);
    console.log(`   Staff Bookings: ${results.dataSync.staffBookings}`);
    console.log(`   Difference: ${results.dataSync.dataDifference}`);
  } else {
    console.log('   ❌ Cannot test data synchronization');
  }
  
  // Solutions
  if (results.solutions.length > 0) {
    console.log('\n💡 RECOMMENDED SOLUTIONS:');
    results.solutions.forEach((solution, index) => {
      console.log(`   ${index + 1}. [${solution.priority}] ${solution.issue}`);
      console.log(`      Solution: ${solution.solution}`);
    });
  } else {
    console.log('\n✅ NO ISSUES DETECTED - All systems working correctly');
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.debugStaffDashboardVisibility = debugStaffDashboardVisibility;
}

export default debugStaffDashboardVisibility;
