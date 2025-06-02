// debug/booking-sync-investigation.js
// Comprehensive Booking Synchronization Investigation

console.log('🔍 Booking Sync Investigation Script Loaded');

/**
 * Comprehensive investigation for booking synchronization issues
 */
async function investigateBookingSynchronization() {
  console.log('🔍 Starting Booking Synchronization Investigation...\n');

  const results = {
    authentication: {},
    customerBooking: {},
    staffAccess: {},
    apiEndpoints: {},
    dataComparison: {},
    errors: []
  };

  try {
    // Step 1: Authentication Setup
    console.log('1️⃣ Setting Up Authentication...');
    results.authentication = await setupAuthentication();
    
    // Step 2: Customer Booking Test
    console.log('\n2️⃣ Testing Customer Booking Creation...');
    results.customerBooking = await testCustomerBookingFlow();
    
    // Step 3: Staff Access Test
    console.log('\n3️⃣ Testing Staff Access to Bookings...');
    results.staffAccess = await testStaffBookingAccess();
    
    // Step 4: API Endpoints Comparison
    console.log('\n4️⃣ Comparing API Endpoints...');
    results.apiEndpoints = await compareAPIEndpoints();
    
    // Step 5: Data Comparison Analysis
    console.log('\n5️⃣ Analyzing Data Synchronization...');
    results.dataComparison = analyzeDataSync(results);
    
    // Step 6: Generate Investigation Report
    console.log('\n📊 Generating Investigation Report...');
    generateInvestigationReport(results);
    
    return results;

  } catch (error) {
    console.error('❌ Investigation failed:', error);
    results.errors.push(`Investigation error: ${error.message}`);
    return results;
  }
}

/**
 * Setup authentication for different roles
 */
async function setupAuthentication() {
  console.log('🔐 Setting up authentication for different roles...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const roles = {
    customer: { email: 'ari@gmail.com', password: 'password123' },
    kasir: { email: 'kasir1@futsalapp.com', password: 'password123' },
    manager: { email: 'manajer1@futsalapp.com', password: 'password123' }
  };

  const tokens = {};

  for (const [role, credentials] of Object.entries(roles)) {
    try {
      console.log(`🔐 Authenticating ${role}...`);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        tokens[role] = data.token;
        console.log(`   ✅ ${role}: ${data.user.name} (${data.user.role})`);
      } else {
        console.log(`   ❌ ${role}: Authentication failed`);
      }

    } catch (error) {
      console.error(`   ❌ ${role}: ${error.message}`);
    }
  }

  return {
    success: Object.keys(tokens).length > 0,
    tokens,
    availableRoles: Object.keys(tokens)
  };
}

/**
 * Test customer booking creation flow
 */
async function testCustomerBookingFlow() {
  console.log('👤 Testing Customer Booking Flow...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const customerToken = localStorage.getItem('auth_token') || 
                       (await setupAuthentication()).tokens.customer;

  if (!customerToken) {
    return { success: false, error: 'No customer token available' };
  }

  try {
    // Step 1: Get available fields
    console.log('🏟️ Getting available fields...');
    const fieldsResponse = await fetch(`${apiUrl}/public/fields`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const fieldsData = await fieldsResponse.json();
    
    if (!fieldsData.success || !fieldsData.data.length) {
      return { success: false, error: 'No fields available' };
    }

    console.log(`   Found ${fieldsData.data.length} fields`);

    // Step 2: Get existing customer bookings (before)
    console.log('📋 Getting existing customer bookings...');
    const beforeBookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const beforeBookingsData = await beforeBookingsResponse.json();
    const beforeCount = beforeBookingsData.data?.length || 0;
    
    console.log(`   Customer has ${beforeCount} existing bookings`);

    // Step 3: Create test booking
    console.log('➕ Creating test booking...');
    const testBooking = {
      field_id: fieldsData.data[0].id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      start_time: "14:00",
      end_time: "15:00",
      name: "Test Customer Booking",
      phone: "081234567890",
      email: "test@customer.com",
      notes: "Test booking for sync investigation"
    };

    const createResponse = await fetch(`${apiUrl}/customer/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(testBooking)
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('   ✅ Booking created successfully');
      console.log(`   Booking ID: ${createData.data?.id}`);
      
      // Step 4: Verify booking was created
      const afterBookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      const afterBookingsData = await afterBookingsResponse.json();
      const afterCount = afterBookingsData.data?.length || 0;
      
      console.log(`   Customer now has ${afterCount} bookings`);

      return {
        success: true,
        bookingCreated: createData.data,
        beforeCount,
        afterCount,
        bookingIncreased: afterCount > beforeCount,
        testBooking
      };
    } else {
      console.log(`   ❌ Booking creation failed: ${createData.error}`);
      return {
        success: false,
        error: createData.error,
        beforeCount
      };
    }

  } catch (error) {
    console.error('❌ Customer booking flow error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test staff access to bookings
 */
async function testStaffBookingAccess() {
  console.log('👨‍💼 Testing Staff Access to Bookings...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const authTokens = (await setupAuthentication()).tokens;
  
  const staffRoles = ['kasir', 'manager'];
  const results = {};

  for (const role of staffRoles) {
    const token = authTokens[role];
    if (!token) {
      results[role] = { success: false, error: 'No token available' };
      continue;
    }

    try {
      console.log(`👨‍💼 Testing ${role} access...`);

      // Test different possible endpoints for staff
      const endpoints = [
        '/staff/bookings',
        '/admin/bookings', 
        '/bookings',
        '/customer/bookings' // Check if staff can access customer endpoint
      ];

      const endpointResults = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${apiUrl}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            endpointResults[endpoint] = {
              success: data.success,
              count: data.data?.length || 0,
              data: data.data?.slice(0, 2) // Sample data
            };
            console.log(`   ✅ ${endpoint}: ${data.data?.length || 0} bookings`);
          } else {
            endpointResults[endpoint] = {
              success: false,
              status: response.status,
              error: `HTTP ${response.status}`
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

      results[role] = {
        success: Object.values(endpointResults).some(r => r.success),
        endpoints: endpointResults,
        accessibleEndpoints: Object.keys(endpointResults).filter(
          ep => endpointResults[ep].success
        )
      };

    } catch (error) {
      console.error(`❌ ${role} access test failed:`, error);
      results[role] = {
        success: false,
        error: error.message
      };
    }
  }

  return {
    success: Object.values(results).some(r => r.success),
    results,
    staffRoles
  };
}

/**
 * Compare API endpoints data
 */
async function compareAPIEndpoints() {
  console.log('🔄 Comparing API Endpoints Data...');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const authTokens = (await setupAuthentication()).tokens;
  
  const comparisons = {};

  // Get customer data
  if (authTokens.customer) {
    try {
      const response = await fetch(`${apiUrl}/customer/bookings`, {
        headers: { 'Authorization': `Bearer ${authTokens.customer}` }
      });
      const data = await response.json();
      comparisons.customer = {
        success: data.success,
        count: data.data?.length || 0,
        sampleBooking: data.data?.[0],
        endpoint: '/customer/bookings'
      };
    } catch (error) {
      comparisons.customer = { success: false, error: error.message };
    }
  }

  // Get staff data (try different endpoints)
  const staffEndpoints = ['/staff/bookings', '/admin/bookings', '/bookings'];
  
  for (const endpoint of staffEndpoints) {
    if (authTokens.manager) {
      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${authTokens.manager}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          comparisons[`staff_${endpoint.replace('/', '')}`] = {
            success: data.success,
            count: data.data?.length || 0,
            sampleBooking: data.data?.[0],
            endpoint
          };
        }
      } catch (error) {
        // Ignore endpoint errors
      }
    }
  }

  return {
    success: Object.keys(comparisons).length > 0,
    comparisons,
    dataConsistency: analyzeDataConsistency(comparisons)
  };
}

/**
 * Analyze data consistency between endpoints
 */
function analyzeDataConsistency(comparisons) {
  const counts = Object.values(comparisons)
    .filter(c => c.success)
    .map(c => c.count);
  
  const uniqueCounts = [...new Set(counts)];
  
  return {
    consistent: uniqueCounts.length <= 1,
    counts,
    uniqueCounts,
    possibleIssue: uniqueCounts.length > 1
  };
}

/**
 * Analyze overall data synchronization
 */
function analyzeDataSync(results) {
  console.log('📊 Analyzing Data Synchronization...');
  
  const issues = [];
  const recommendations = [];

  // Check if customer booking was created
  if (!results.customerBooking.success) {
    issues.push('Customer booking creation failed');
    recommendations.push('Check customer booking API and permissions');
  }

  // Check if staff can access bookings
  if (!results.staffAccess.success) {
    issues.push('Staff cannot access booking data');
    recommendations.push('Verify staff booking endpoints and role permissions');
  }

  // Check data consistency
  if (results.apiEndpoints.dataConsistency?.possibleIssue) {
    issues.push('Data inconsistency between customer and staff views');
    recommendations.push('Check API filtering and role-based data access');
  }

  return {
    issues,
    recommendations,
    overallHealth: issues.length === 0 ? 'healthy' : 'issues_detected',
    syncStatus: issues.length === 0 ? 'synchronized' : 'out_of_sync'
  };
}

/**
 * Generate comprehensive investigation report
 */
function generateInvestigationReport(results) {
  console.log('\n📊 BOOKING SYNCHRONIZATION INVESTIGATION REPORT');
  console.log('='.repeat(60));
  
  // Authentication Status
  console.log('\n🔐 AUTHENTICATION STATUS:');
  if (results.authentication.success) {
    console.log(`   ✅ Available Roles: ${results.authentication.availableRoles.join(', ')}`);
  } else {
    console.log('   ❌ Authentication setup failed');
  }
  
  // Customer Booking Status
  console.log('\n👤 CUSTOMER BOOKING STATUS:');
  if (results.customerBooking.success) {
    console.log('   ✅ Customer can create bookings');
    console.log(`   📊 Booking count increased: ${results.customerBooking.bookingIncreased}`);
    console.log(`   📈 Before: ${results.customerBooking.beforeCount}, After: ${results.customerBooking.afterCount}`);
  } else {
    console.log('   ❌ Customer booking creation failed');
    console.log(`   Error: ${results.customerBooking.error}`);
  }
  
  // Staff Access Status
  console.log('\n👨‍💼 STAFF ACCESS STATUS:');
  if (results.staffAccess.success) {
    console.log('   ✅ Staff can access booking data');
    Object.entries(results.staffAccess.results).forEach(([role, data]) => {
      if (data.success) {
        console.log(`   ✅ ${role}: Can access ${data.accessibleEndpoints.join(', ')}`);
      } else {
        console.log(`   ❌ ${role}: No accessible endpoints`);
      }
    });
  } else {
    console.log('   ❌ Staff cannot access booking data');
  }
  
  // Data Synchronization Status
  console.log('\n🔄 DATA SYNCHRONIZATION STATUS:');
  console.log(`   Status: ${results.dataComparison.syncStatus}`);
  console.log(`   Health: ${results.dataComparison.overallHealth}`);
  
  if (results.dataComparison.issues.length > 0) {
    console.log('\n🚨 ISSUES DETECTED:');
    results.dataComparison.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (results.dataComparison.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    results.dataComparison.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  // API Endpoints Comparison
  if (results.apiEndpoints.comparisons) {
    console.log('\n📋 API ENDPOINTS COMPARISON:');
    Object.entries(results.apiEndpoints.comparisons).forEach(([key, data]) => {
      if (data.success) {
        console.log(`   ✅ ${key} (${data.endpoint}): ${data.count} bookings`);
      } else {
        console.log(`   ❌ ${key}: ${data.error}`);
      }
    });
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.investigateBookingSynchronization = investigateBookingSynchronization;
}

export default investigateBookingSynchronization;
