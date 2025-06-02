// debug/customer-endpoint-enhancement-test.js
// Test Customer Endpoint Enhancement untuk Staff Access

console.log('🔧 Customer Endpoint Enhancement Test Loaded');

/**
 * Test customer endpoint enhancement untuk staff access
 */
async function testCustomerEndpointEnhancement() {
  console.log('🔧 Testing Customer Endpoint Enhancement for Staff Access...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  const results = {
    baseline: {},
    customerAccess: {},
    staffAccess: {},
    enhancement: {},
    summary: {}
  };

  try {
    // Step 1: Baseline Test - Customer Data
    console.log('1️⃣ Baseline Test - Customer Data...');
    results.baseline = await testCustomerBaseline(apiUrl);
    
    // Step 2: Customer Access Test
    console.log('\n2️⃣ Customer Access Test...');
    results.customerAccess = await testCustomerAccess(apiUrl);
    
    // Step 3: Staff Access Test (Enhanced)
    console.log('\n3️⃣ Staff Access Test (Enhanced)...');
    results.staffAccess = await testStaffAccess(apiUrl);
    
    // Step 4: Enhancement Verification
    console.log('\n4️⃣ Enhancement Verification...');
    results.enhancement = verifyEnhancement(results);
    
    // Step 5: Generate Summary
    console.log('\n5️⃣ Generating Test Summary...');
    results.summary = generateEnhancementSummary(results);
    
    return results;

  } catch (error) {
    console.error('❌ Customer endpoint enhancement test failed:', error);
    return { error: error.message };
  }
}

/**
 * Test customer baseline data
 */
async function testCustomerBaseline(apiUrl) {
  console.log('📊 Testing customer baseline data...');
  
  const baseline = {
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
    baseline.loginSuccess = loginData.success;

    if (loginData.success) {
      console.log(`   ✅ Customer login: ${loginData.user.name}`);
      
      // Get customer bookings
      const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });

      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        baseline.bookingCount = bookingsData.data.length;
        baseline.bookingDetails = bookingsData.data;
        baseline.dataAvailable = bookingsData.data.length > 0;
        baseline.metadata = bookingsData._metadata;
        
        console.log(`   📊 Customer bookings: ${baseline.bookingCount}`);
        console.log(`   🔍 Access type: ${bookingsData._metadata?.access_type || 'unknown'}`);
        console.log(`   👤 User role: ${bookingsData._metadata?.user_role || 'unknown'}`);
        
        if (baseline.dataAvailable) {
          const sample = bookingsData.data[0];
          console.log(`   📋 Sample booking: ID ${sample.id}, Status: ${sample.status}`);
        }
      }
    } else {
      console.log(`   ❌ Customer login failed: ${loginData.error}`);
    }

    return baseline;

  } catch (error) {
    console.error('   ❌ Customer baseline test failed:', error);
    return { ...baseline, error: error.message };
  }
}

/**
 * Test customer access (should see only own bookings)
 */
async function testCustomerAccess(apiUrl) {
  console.log('👤 Testing customer access...');
  
  const customerAccess = {
    accessType: 'unknown',
    bookingCount: 0,
    isLimited: false,
    metadata: null
  };

  try {
    // Already logged in as customer from baseline test
    const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
      method: 'GET',
      credentials: 'include'
    });

    const bookingsData = await bookingsResponse.json();
    if (bookingsData.success) {
      customerAccess.bookingCount = bookingsData.data.length;
      customerAccess.metadata = bookingsData._metadata;
      customerAccess.accessType = bookingsData._metadata?.access_type || 'unknown';
      customerAccess.isLimited = bookingsData._metadata?.access_type === 'user_bookings';
      
      console.log(`   📊 Customer sees: ${customerAccess.bookingCount} bookings`);
      console.log(`   🔍 Access type: ${customerAccess.accessType}`);
      console.log(`   ⚠️ Limited access: ${customerAccess.isLimited ? 'YES' : 'NO'}`);
    }

    return customerAccess;

  } catch (error) {
    console.error('   ❌ Customer access test failed:', error);
    return { ...customerAccess, error: error.message };
  }
}

/**
 * Test staff access (should see all bookings with enhancement)
 */
async function testStaffAccess(apiUrl) {
  console.log('👥 Testing staff access...');
  
  const staffRoles = [
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir', name: 'Kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal', name: 'Manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem', name: 'Supervisor' }
  ];

  const staffResults = {};

  for (const staff of staffRoles) {
    try {
      console.log(`   🔍 Testing ${staff.name} (${staff.role})...`);
      
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
        
        // Test customer endpoint access
        const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
          method: 'GET',
          credentials: 'include'
        });

        const bookingsData = await bookingsResponse.json();
        
        if (bookingsData.success) {
          staffResults[staff.role] = {
            loginSuccess: true,
            user: loginData.user,
            bookingCount: bookingsData.data.length,
            accessType: bookingsData._metadata?.access_type || 'unknown',
            isStaffAccess: bookingsData._metadata?.is_staff_access || false,
            canSeeAllBookings: bookingsData._metadata?.access_type === 'all_bookings',
            metadata: bookingsData._metadata
          };
          
          console.log(`     📊 ${staff.name} sees: ${bookingsData.data.length} bookings`);
          console.log(`     🔍 Access type: ${bookingsData._metadata?.access_type}`);
          console.log(`     👥 Staff access: ${bookingsData._metadata?.is_staff_access ? 'YES' : 'NO'}`);
          
          if (bookingsData.data.length > 0) {
            const sample = bookingsData.data[0];
            console.log(`     📋 Sample: ID ${sample.id}, User: ${sample.user_name || sample.name}`);
          }
          
        } else {
          staffResults[staff.role] = {
            loginSuccess: true,
            user: loginData.user,
            bookingCount: 0,
            error: bookingsData.error
          };
          console.log(`     ❌ Booking access failed: ${bookingsData.error}`);
        }

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
      console.error(`     ❌ ${staff.name} test failed:`, error.message);
    }
  }

  return staffResults;
}

/**
 * Verify enhancement is working
 */
function verifyEnhancement(results) {
  console.log('🔍 Verifying enhancement...');
  
  const enhancement = {
    customerDataExists: results.baseline.dataAvailable,
    customerAccessLimited: results.customerAccess.isLimited,
    staffCanSeeAll: false,
    enhancementWorking: false,
    issues: []
  };

  // Check if staff can see all bookings
  const staffWithAccess = Object.values(results.staffAccess).filter(staff => 
    staff.loginSuccess && staff.canSeeAllBookings
  );
  
  enhancement.staffCanSeeAll = staffWithAccess.length > 0;
  
  // Check if enhancement is working
  enhancement.enhancementWorking = 
    enhancement.customerDataExists && 
    enhancement.customerAccessLimited && 
    enhancement.staffCanSeeAll;

  // Identify issues
  if (!enhancement.customerDataExists) {
    enhancement.issues.push('No customer booking data exists');
  }
  
  if (!enhancement.customerAccessLimited) {
    enhancement.issues.push('Customer access not properly limited');
  }
  
  if (!enhancement.staffCanSeeAll) {
    enhancement.issues.push('Staff cannot see all bookings (enhancement not working)');
  }

  console.log(`   📊 Customer data exists: ${enhancement.customerDataExists ? 'YES' : 'NO'}`);
  console.log(`   🔒 Customer access limited: ${enhancement.customerAccessLimited ? 'YES' : 'NO'}`);
  console.log(`   👥 Staff can see all: ${enhancement.staffCanSeeAll ? 'YES' : 'NO'}`);
  console.log(`   ✅ Enhancement working: ${enhancement.enhancementWorking ? 'YES' : 'NO'}`);

  return enhancement;
}

/**
 * Generate enhancement test summary
 */
function generateEnhancementSummary(results) {
  console.log('\n📊 CUSTOMER ENDPOINT ENHANCEMENT TEST SUMMARY');
  console.log('='.repeat(70));
  
  // Baseline Data
  console.log('\n📊 BASELINE DATA:');
  console.log(`   Customer bookings: ${results.baseline.dataAvailable ? '✅' : '❌'} ${results.baseline.bookingCount} found`);
  
  // Customer Access
  console.log('\n👤 CUSTOMER ACCESS:');
  console.log(`   Access type: ${results.customerAccess.accessType}`);
  console.log(`   Limited access: ${results.customerAccess.isLimited ? '✅' : '❌'} ${results.customerAccess.isLimited ? 'Properly limited' : 'Not limited'}`);
  console.log(`   Bookings visible: ${results.customerAccess.bookingCount}`);
  
  // Staff Access
  console.log('\n👥 STAFF ACCESS:');
  Object.entries(results.staffAccess).forEach(([role, data]) => {
    if (data.loginSuccess) {
      const status = data.canSeeAllBookings ? '✅' : '❌';
      console.log(`   ${status} ${role}: ${data.bookingCount} bookings (${data.accessType})`);
    } else {
      console.log(`   ❌ ${role}: Login failed`);
    }
  });
  
  // Enhancement Status
  console.log('\n🔧 ENHANCEMENT STATUS:');
  if (results.enhancement.enhancementWorking) {
    console.log('   ✅ ENHANCEMENT WORKING CORRECTLY!');
    console.log('   📊 Customer sees only own bookings');
    console.log('   👥 Staff can see all bookings');
  } else {
    console.log('   ❌ ENHANCEMENT NOT WORKING');
    console.log('   🚨 Issues found:');
    results.enhancement.issues.forEach((issue, index) => {
      console.log(`     ${index + 1}. ${issue}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.enhancement.enhancementWorking) {
    console.log('   ✅ No action needed - enhancement working correctly');
    console.log('   📝 Consider deploying this fix to production');
  } else if (!results.enhancement.customerDataExists) {
    console.log('   1. Create test booking data first');
    console.log('   2. Verify customer booking creation works');
  } else if (!results.enhancement.staffCanSeeAll) {
    console.log('   1. Deploy the enhanced customer controller to production');
    console.log('   2. Verify role-based access logic is working');
    console.log('   3. Check backend logs for role detection');
  }

  return {
    enhancementWorking: results.enhancement.enhancementWorking,
    customerDataExists: results.enhancement.customerDataExists,
    staffCanSeeAll: results.enhancement.staffCanSeeAll,
    issueCount: results.enhancement.issues.length,
    status: results.enhancement.enhancementWorking ? 'success' : 'needs_deployment'
  };
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testCustomerEndpointEnhancement = testCustomerEndpointEnhancement;
}

export default testCustomerEndpointEnhancement;
