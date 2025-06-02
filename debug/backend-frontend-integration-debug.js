// debug/backend-frontend-integration-debug.js
// Comprehensive Backend-Frontend Integration Debug for Booking Data

console.log('🔗 Backend-Frontend Integration Debug Loaded');

/**
 * Comprehensive investigation for backend-frontend booking data integration
 */
async function investigateBookingDataIntegration() {
  console.log('🔗 Starting Backend-Frontend Booking Data Integration Investigation...\n');

  const results = {
    backendVerification: {},
    frontendEndpoints: {},
    roleBasedAccess: {},
    dataFlow: {},
    integration: {},
    recommendations: []
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    // Step 1: Backend Data Verification
    console.log('1️⃣ Backend Data Verification...');
    results.backendVerification = await verifyBackendData();
    
    // Step 2: Frontend Endpoint Testing
    console.log('\n2️⃣ Frontend Endpoint Testing...');
    results.frontendEndpoints = await testFrontendEndpoints();
    
    // Step 3: Role-Based Access Testing
    console.log('\n3️⃣ Role-Based Access Testing...');
    results.roleBasedAccess = await testRoleBasedAccess();
    
    // Step 4: Data Flow Analysis
    console.log('\n4️⃣ Data Flow Analysis...');
    results.dataFlow = await analyzeDataFlow();
    
    // Step 5: Integration Analysis
    console.log('\n5️⃣ Integration Analysis...');
    results.integration = analyzeIntegration(results);
    
    // Step 6: Generate Recommendations
    console.log('\n6️⃣ Generating Recommendations...');
    results.recommendations = generateRecommendations(results);
    
    // Step 7: Generate Final Report
    console.log('\n📊 Generating Integration Report...');
    generateIntegrationReport(results);
    
    return results;

  } catch (error) {
    console.error('❌ Integration investigation failed:', error);
    return { error: error.message };
  }
}

/**
 * Verify backend data exists and is accessible
 */
async function verifyBackendData() {
  console.log('🗄️ Verifying backend data...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const verification = {
    customerBookingExists: false,
    customerBookingCount: 0,
    customerBookingDetails: null,
    backendHealthy: false
  };

  try {
    // Check backend health
    const healthResponse = await fetch(`${apiUrl}/test/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      verification.backendHealthy = healthData.status === 'healthy';
      console.log(`   ✅ Backend health: ${healthData.status}`);
    }

    // Login as customer to verify booking data
    const customerLogin = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    const customerData = await customerLogin.json();
    if (customerData.success) {
      console.log(`   ✅ Customer login: ${customerData.user.name}`);
      
      // Get customer bookings
      const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });

      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        verification.customerBookingExists = bookingsData.data.length > 0;
        verification.customerBookingCount = bookingsData.data.length;
        verification.customerBookingDetails = bookingsData.data[0] || null;
        
        console.log(`   📊 Customer bookings found: ${verification.customerBookingCount}`);
        if (verification.customerBookingDetails) {
          console.log(`   📋 Latest booking: ID ${verification.customerBookingDetails.id}, Status: ${verification.customerBookingDetails.status}`);
        }
      }
    }

    return verification;

  } catch (error) {
    console.error('   ❌ Backend verification failed:', error);
    return { ...verification, error: error.message };
  }
}

/**
 * Test all frontend endpoints for staff access
 */
async function testFrontendEndpoints() {
  console.log('🌐 Testing frontend endpoints...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const endpoints = [
    { path: '/customer/bookings', description: 'Customer bookings endpoint' },
    { path: '/staff/manager/bookings', description: 'Manager bookings endpoint (new)' },
    { path: '/staff/kasir/dashboard', description: 'Kasir dashboard' },
    { path: '/staff/manager/dashboard', description: 'Manager dashboard' },
    { path: '/staff/supervisor/dashboard', description: 'Supervisor dashboard' },
    { path: '/admin/bookings', description: 'Admin bookings endpoint' }
  ];

  const results = {};

  // Login as manager for testing
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

  for (const endpoint of endpoints) {
    try {
      console.log(`   🔍 Testing ${endpoint.path}...`);
      
      const response = await fetch(`${apiUrl}${endpoint.path}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        results[endpoint.path] = {
          success: true,
          status: response.status,
          dataCount: data.data?.length || 0,
          hasBookingData: data.data && Array.isArray(data.data) && data.data.length > 0,
          responseStructure: {
            hasSuccess: 'success' in data,
            hasData: 'data' in data,
            dataType: Array.isArray(data.data) ? 'array' : typeof data.data
          },
          sampleData: data.data?.slice(0, 1)
        };
        console.log(`     ✅ ${endpoint.path}: ${data.data?.length || 0} items`);
      } else {
        const errorText = await response.text();
        results[endpoint.path] = {
          success: false,
          status: response.status,
          error: errorText,
          description: endpoint.description
        };
        console.log(`     ❌ ${endpoint.path}: HTTP ${response.status}`);
      }

    } catch (error) {
      results[endpoint.path] = {
        success: false,
        error: error.message,
        description: endpoint.description
      };
      console.log(`     ❌ ${endpoint.path}: ${error.message}`);
    }
  }

  const workingEndpoints = Object.keys(results).filter(ep => results[ep].success);
  const bookingEndpoints = Object.keys(results).filter(ep => 
    results[ep].success && results[ep].hasBookingData
  );

  console.log(`   📊 Summary: ${workingEndpoints.length}/${endpoints.length} endpoints working`);
  console.log(`   📋 Booking data available: ${bookingEndpoints.length} endpoints`);

  return {
    results,
    workingEndpoints,
    bookingEndpoints,
    totalTested: endpoints.length
  };
}

/**
 * Test role-based access for each staff role
 */
async function testRoleBasedAccess() {
  console.log('👥 Testing role-based access...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const staffRoles = [
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir', expectedAccess: ['customer/bookings'] },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal', expectedAccess: ['customer/bookings', 'staff/manager/bookings'] },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem', expectedAccess: ['customer/bookings', 'staff/manager/bookings', 'admin/bookings'] }
  ];

  const roleResults = {};

  for (const staff of staffRoles) {
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
        
        // Test access to booking endpoints
        const accessResults = {};
        
        for (const endpoint of staff.expectedAccess) {
          try {
            const response = await fetch(`${apiUrl}/${endpoint}`, {
              method: 'GET',
              credentials: 'include'
            });

            if (response.ok) {
              const data = await response.json();
              accessResults[endpoint] = {
                canAccess: true,
                bookingCount: data.data?.length || 0,
                hasBookings: data.data && data.data.length > 0
              };
              console.log(`     ✅ /${endpoint}: ${data.data?.length || 0} bookings`);
            } else {
              accessResults[endpoint] = {
                canAccess: false,
                status: response.status,
                error: await response.text()
              };
              console.log(`     ❌ /${endpoint}: HTTP ${response.status}`);
            }
          } catch (error) {
            accessResults[endpoint] = {
              canAccess: false,
              error: error.message
            };
            console.log(`     ❌ /${endpoint}: ${error.message}`);
          }
        }

        roleResults[staff.role] = {
          loginSuccess: true,
          user: loginData.user,
          accessResults,
          canSeeBookings: Object.values(accessResults).some(r => r.canAccess && r.hasBookings),
          totalBookingsVisible: Math.max(...Object.values(accessResults)
            .filter(r => r.canAccess)
            .map(r => r.bookingCount || 0), 0)
        };

      } else {
        roleResults[staff.role] = {
          loginSuccess: false,
          error: loginData.error
        };
        console.log(`     ❌ Login failed: ${loginData.error}`);
      }

    } catch (error) {
      roleResults[staff.role] = {
        loginSuccess: false,
        error: error.message
      };
      console.error(`     ❌ ${staff.role} test failed:`, error.message);
    }
  }

  return roleResults;
}

/**
 * Analyze data flow from backend to frontend
 */
async function analyzeDataFlow() {
  console.log('🔄 Analyzing data flow...');
  
  const analysis = {
    customerToBackend: false,
    backendToStaff: false,
    dataConsistency: false,
    syncIssues: []
  };

  try {
    // Test customer data creation and staff visibility
    console.log('   📝 Testing customer booking creation...');
    
    // Login as customer
    const apiUrl = import.meta.env.VITE_API_URL;
    const customerLogin = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    const customerData = await customerLogin.json();
    if (customerData.success) {
      // Get customer bookings count before
      const beforeResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });
      const beforeData = await beforeResponse.json();
      const beforeCount = beforeData.data?.length || 0;
      
      analysis.customerToBackend = beforeCount > 0;
      console.log(`     📊 Customer has ${beforeCount} existing bookings`);
    }

    // Test staff access to the same data
    console.log('   👨‍💼 Testing staff access to customer data...');
    
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
    if (managerData.success) {
      const managerResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });
      const managerBookings = await managerResponse.json();
      const managerCount = managerBookings.data?.length || 0;
      
      analysis.backendToStaff = managerCount > 0;
      console.log(`     📊 Manager can see ${managerCount} bookings`);
      
      // Check data consistency
      if (analysis.customerToBackend && !analysis.backendToStaff) {
        analysis.syncIssues.push('Customer has bookings but staff cannot see them');
        console.log('     🚨 SYNC ISSUE: Customer bookings not visible to staff');
      } else if (analysis.customerToBackend && analysis.backendToStaff) {
        analysis.dataConsistency = true;
        console.log('     ✅ Data consistency: Staff can see customer bookings');
      }
    }

    return analysis;

  } catch (error) {
    console.error('   ❌ Data flow analysis failed:', error);
    return { ...analysis, error: error.message };
  }
}

/**
 * Analyze overall integration status
 */
function analyzeIntegration(results) {
  console.log('🔍 Analyzing integration status...');
  
  const integration = {
    backendHealthy: results.backendVerification?.backendHealthy || false,
    dataExists: results.backendVerification?.customerBookingExists || false,
    endpointsWorking: (results.frontendEndpoints?.workingEndpoints?.length || 0) > 0,
    staffCanAccess: Object.values(results.roleBasedAccess || {}).some(r => r.loginSuccess),
    staffCanSeeBookings: Object.values(results.roleBasedAccess || {}).some(r => r.canSeeBookings),
    dataFlowWorking: results.dataFlow?.dataConsistency || false,
    criticalIssues: [],
    status: 'unknown'
  };

  // Identify critical issues
  if (!integration.backendHealthy) {
    integration.criticalIssues.push('Backend not healthy');
  }
  if (!integration.dataExists) {
    integration.criticalIssues.push('No customer booking data exists');
  }
  if (!integration.endpointsWorking) {
    integration.criticalIssues.push('No frontend endpoints working');
  }
  if (!integration.staffCanAccess) {
    integration.criticalIssues.push('Staff cannot authenticate');
  }
  if (integration.dataExists && !integration.staffCanSeeBookings) {
    integration.criticalIssues.push('Staff cannot see customer bookings (MAIN ISSUE)');
  }

  // Determine overall status
  if (integration.criticalIssues.length === 0) {
    integration.status = 'healthy';
  } else if (integration.criticalIssues.includes('Staff cannot see customer bookings (MAIN ISSUE)')) {
    integration.status = 'data_sync_issue';
  } else {
    integration.status = 'critical_failure';
  }

  console.log(`   📊 Integration status: ${integration.status}`);
  console.log(`   🚨 Critical issues: ${integration.criticalIssues.length}`);

  return integration;
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(results) {
  const recommendations = [];
  const integration = results.integration;

  if (integration.criticalIssues.includes('Staff cannot see customer bookings (MAIN ISSUE)')) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Staff cannot see customer bookings',
      solution: 'Implement dedicated staff booking endpoint that returns all bookings',
      action: 'Deploy /staff/manager/bookings endpoint to production'
    });
  }

  if (!results.frontendEndpoints?.bookingEndpoints?.length) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'No booking endpoints returning data for staff',
      solution: 'Fix API endpoints to return booking data for staff roles',
      action: 'Check role-based access control and endpoint implementation'
    });
  }

  if (results.dataFlow?.syncIssues?.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Data synchronization issues detected',
      solution: 'Implement real-time data sync between customer and staff views',
      action: 'Review data filtering logic in backend endpoints'
    });
  }

  return recommendations;
}

/**
 * Generate comprehensive integration report
 */
function generateIntegrationReport(results) {
  console.log('\n📊 BACKEND-FRONTEND INTEGRATION REPORT');
  console.log('='.repeat(70));
  
  // Backend Status
  console.log('\n🗄️ BACKEND STATUS:');
  if (results.backendVerification.backendHealthy) {
    console.log('   ✅ Backend: Healthy and accessible');
    console.log(`   📊 Customer bookings: ${results.backendVerification.customerBookingCount} found`);
  } else {
    console.log('   ❌ Backend: Issues detected');
  }
  
  // Frontend Endpoints
  console.log('\n🌐 FRONTEND ENDPOINTS:');
  if (results.frontendEndpoints.workingEndpoints) {
    console.log(`   ✅ Working endpoints: ${results.frontendEndpoints.workingEndpoints.length}/${results.frontendEndpoints.totalTested}`);
    console.log(`   📋 Booking data endpoints: ${results.frontendEndpoints.bookingEndpoints?.length || 0}`);
    
    results.frontendEndpoints.workingEndpoints.forEach(ep => {
      const data = results.frontendEndpoints.results[ep];
      console.log(`     ${data.hasBookingData ? '✅' : '⚠️'} ${ep}: ${data.dataCount} items`);
    });
  }
  
  // Role-Based Access
  console.log('\n👥 ROLE-BASED ACCESS:');
  Object.entries(results.roleBasedAccess).forEach(([role, data]) => {
    if (data.loginSuccess) {
      console.log(`   ✅ ${role}: Login OK, Can see bookings: ${data.canSeeBookings ? 'YES' : 'NO'}`);
      console.log(`     📊 Total bookings visible: ${data.totalBookingsVisible}`);
    } else {
      console.log(`   ❌ ${role}: Login failed`);
    }
  });
  
  // Data Flow
  console.log('\n🔄 DATA FLOW:');
  console.log(`   Customer → Backend: ${results.dataFlow.customerToBackend ? '✅' : '❌'}`);
  console.log(`   Backend → Staff: ${results.dataFlow.backendToStaff ? '✅' : '❌'}`);
  console.log(`   Data Consistency: ${results.dataFlow.dataConsistency ? '✅' : '❌'}`);
  
  if (results.dataFlow.syncIssues?.length > 0) {
    console.log('   🚨 Sync Issues:');
    results.dataFlow.syncIssues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
  }
  
  // Integration Status
  console.log('\n🔍 INTEGRATION STATUS:');
  console.log(`   Overall Status: ${results.integration.status.toUpperCase()}`);
  
  if (results.integration.criticalIssues.length > 0) {
    console.log('   🚨 Critical Issues:');
    results.integration.criticalIssues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
  }
  
  // Recommendations
  if (results.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`      Solution: ${rec.solution}`);
      console.log(`      Action: ${rec.action}`);
    });
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.investigateBookingDataIntegration = investigateBookingDataIntegration;
}

export default investigateBookingDataIntegration;
