// debug/quick-api-test.js
// Quick API test to identify specific errors

console.log('⚡ Quick API Test Loaded');

/**
 * Quick test to identify which API is failing
 */
async function quickAPITest() {
  console.log('⚡ Starting Quick API Test...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`🌐 API URL: ${apiUrl}`);

  const results = {
    backend: '❓',
    customerAuth: '❓',
    customerBookings: '❓',
    staffAuth: '❓',
    staffEndpoints: {},
    summary: ''
  };

  try {
    // Test 1: Backend Health (Most Basic)
    console.log('1️⃣ Testing Backend Health...');
    try {
      const healthResponse = await fetch(`${apiUrl}/test/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        results.backend = `✅ ${healthData.status}`;
        console.log(`   ✅ Backend: ${healthData.status}`);
      } else {
        results.backend = `❌ HTTP ${healthResponse.status}`;
        console.log(`   ❌ Backend: HTTP ${healthResponse.status}`);
      }
    } catch (error) {
      results.backend = `❌ ${error.message}`;
      console.log(`   ❌ Backend: ${error.message}`);
    }

    // Test 2: Customer Authentication
    console.log('\n2️⃣ Testing Customer Authentication...');
    try {
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
        if (loginData.success) {
          results.customerAuth = `✅ ${loginData.user.name}`;
          console.log(`   ✅ Customer Auth: ${loginData.user.name}`);
          
          // Store user for frontend API testing
          localStorage.setItem('user', JSON.stringify(loginData.user));
          
          // Test 3: Customer Bookings
          console.log('\n3️⃣ Testing Customer Bookings...');
          try {
            const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
              method: 'GET',
              credentials: 'include'
            });

            if (bookingsResponse.ok) {
              const bookingsData = await bookingsResponse.json();
              if (bookingsData.success) {
                results.customerBookings = `✅ ${bookingsData.data.length} bookings`;
                console.log(`   ✅ Customer Bookings: ${bookingsData.data.length} found`);
              } else {
                results.customerBookings = `❌ ${bookingsData.error}`;
                console.log(`   ❌ Customer Bookings: ${bookingsData.error}`);
              }
            } else {
              results.customerBookings = `❌ HTTP ${bookingsResponse.status}`;
              console.log(`   ❌ Customer Bookings: HTTP ${bookingsResponse.status}`);
            }
          } catch (error) {
            results.customerBookings = `❌ ${error.message}`;
            console.log(`   ❌ Customer Bookings: ${error.message}`);
          }

        } else {
          results.customerAuth = `❌ ${loginData.error}`;
          console.log(`   ❌ Customer Auth: ${loginData.error}`);
        }
      } else {
        results.customerAuth = `❌ HTTP ${loginResponse.status}`;
        console.log(`   ❌ Customer Auth: HTTP ${loginResponse.status}`);
      }
    } catch (error) {
      results.customerAuth = `❌ ${error.message}`;
      console.log(`   ❌ Customer Auth: ${error.message}`);
    }

    // Test 4: Staff Authentication
    console.log('\n4️⃣ Testing Staff Authentication...');
    try {
      const staffLoginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'manajer1@futsalapp.com',
          password: 'password123'
        })
      });

      if (staffLoginResponse.ok) {
        const staffLoginData = await staffLoginResponse.json();
        if (staffLoginData.success) {
          results.staffAuth = `✅ ${staffLoginData.user.name}`;
          console.log(`   ✅ Staff Auth: ${staffLoginData.user.name} (${staffLoginData.user.role})`);
          
          // Store staff user for testing
          localStorage.setItem('user', JSON.stringify(staffLoginData.user));

          // Test 5: Staff Endpoints
          console.log('\n5️⃣ Testing Staff Endpoints...');
          const staffEndpoints = [
            '/staff/manager/bookings',
            '/staff/kasir/bookings',
            '/admin/bookings',
            '/customer/bookings'
          ];

          for (const endpoint of staffEndpoints) {
            try {
              console.log(`   🔍 Testing ${endpoint}...`);
              const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'GET',
                credentials: 'include'
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success) {
                  results.staffEndpoints[endpoint] = `✅ ${data.data?.length || 0} items`;
                  console.log(`     ✅ ${endpoint}: ${data.data?.length || 0} items`);
                } else {
                  results.staffEndpoints[endpoint] = `❌ ${data.error}`;
                  console.log(`     ❌ ${endpoint}: ${data.error}`);
                }
              } else {
                results.staffEndpoints[endpoint] = `❌ HTTP ${response.status}`;
                console.log(`     ❌ ${endpoint}: HTTP ${response.status}`);
              }
            } catch (error) {
              results.staffEndpoints[endpoint] = `❌ ${error.message}`;
              console.log(`     ❌ ${endpoint}: ${error.message}`);
            }
          }

        } else {
          results.staffAuth = `❌ ${staffLoginData.error}`;
          console.log(`   ❌ Staff Auth: ${staffLoginData.error}`);
        }
      } else {
        results.staffAuth = `❌ HTTP ${staffLoginResponse.status}`;
        console.log(`   ❌ Staff Auth: HTTP ${staffLoginResponse.status}`);
      }
    } catch (error) {
      results.staffAuth = `❌ ${error.message}`;
      console.log(`   ❌ Staff Auth: ${error.message}`);
    }

    // Generate Summary
    console.log('\n📊 QUICK API TEST SUMMARY');
    console.log('='.repeat(40));
    console.log(`Backend Health: ${results.backend}`);
    console.log(`Customer Auth: ${results.customerAuth}`);
    console.log(`Customer Bookings: ${results.customerBookings}`);
    console.log(`Staff Auth: ${results.staffAuth}`);
    console.log('Staff Endpoints:');
    Object.entries(results.staffEndpoints).forEach(([endpoint, status]) => {
      console.log(`  ${endpoint}: ${status}`);
    });

    // Identify the main issue
    console.log('\n🎯 MAIN ISSUE IDENTIFICATION:');
    if (results.backend.includes('❌')) {
      results.summary = 'BACKEND CONNECTIVITY ISSUE';
      console.log('🚨 BACKEND CONNECTIVITY ISSUE - Backend not accessible');
    } else if (results.customerAuth.includes('❌')) {
      results.summary = 'AUTHENTICATION SYSTEM ISSUE';
      console.log('🚨 AUTHENTICATION SYSTEM ISSUE - Login not working');
    } else if (results.customerBookings.includes('❌')) {
      results.summary = 'CUSTOMER BOOKING API ISSUE';
      console.log('🚨 CUSTOMER BOOKING API ISSUE - Cannot retrieve customer bookings');
    } else if (results.staffAuth.includes('❌')) {
      results.summary = 'STAFF AUTHENTICATION ISSUE';
      console.log('🚨 STAFF AUTHENTICATION ISSUE - Staff cannot login');
    } else {
      const workingStaffEndpoints = Object.values(results.staffEndpoints).filter(s => s.includes('✅')).length;
      const totalStaffEndpoints = Object.keys(results.staffEndpoints).length;
      
      if (workingStaffEndpoints === 0) {
        results.summary = 'STAFF ENDPOINT ISSUE - NO ENDPOINTS WORKING';
        console.log('🚨 STAFF ENDPOINT ISSUE - No staff endpoints are working');
        console.log('💡 This is likely the main problem: Staff endpoints not implemented or deployed');
      } else if (workingStaffEndpoints < totalStaffEndpoints) {
        results.summary = 'PARTIAL STAFF ENDPOINT ISSUE';
        console.log(`⚠️ PARTIAL STAFF ENDPOINT ISSUE - Only ${workingStaffEndpoints}/${totalStaffEndpoints} endpoints working`);
      } else {
        results.summary = 'ALL APIS WORKING - DATA SYNC ISSUE';
        console.log('✅ All APIs working - Issue may be in data synchronization logic');
      }
    }

    return results;

  } catch (error) {
    console.error('❌ Quick API test failed:', error);
    results.summary = `TEST FAILED: ${error.message}`;
    return results;
  }
}

/**
 * Test frontend API specifically
 */
async function testFrontendAPI() {
  console.log('🌐 Testing Frontend API Implementation...\n');

  try {
    // Import the frontend API
    const { getAllBookings } = await import('../src/api/bookingAPI.js');
    
    console.log('📋 Testing getAllBookings function...');
    
    // Make sure user is set in localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      console.log('⚠️ No user in localStorage, setting manager user...');
      localStorage.setItem('user', JSON.stringify({
        id: 2,
        name: 'Manager Test',
        role: 'manajer_futsal'
      }));
    }

    const result = await getAllBookings();
    
    console.log('✅ Frontend API Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Data count: ${result.data?.length || 0}`);
    console.log(`   Endpoint used: ${result._metadata?.endpoint_used}`);
    console.log(`   User role: ${result._metadata?.user_role}`);
    console.log(`   Limited view: ${result._metadata?.is_limited_view}`);
    console.log(`   Attempts: ${result._metadata?.attempt_number}/${result._metadata?.total_attempts}`);

    return {
      success: true,
      result
    };

  } catch (error) {
    console.error('❌ Frontend API test failed:', error);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Response data: ${error.response?.data?.error}`);
    console.error(`   Status: ${error.response?.status}`);

    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      responseError: error.response?.data?.error
    };
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.quickAPITest = quickAPITest;
  window.testFrontendAPI = testFrontendAPI;
}

export { quickAPITest, testFrontendAPI };
