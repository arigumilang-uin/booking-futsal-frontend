// debug/staff-booking-workaround.js
// Temporary workaround for staff to see all bookings

console.log('🔧 Staff Booking Workaround Loaded');

/**
 * Workaround function to get all bookings for staff
 * This function will aggregate bookings from multiple sources
 */
async function getStaffBookingsWorkaround() {
  console.log('🔧 Starting Staff Bookings Workaround...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  const allBookings = [];
  const errors = [];

  try {
    // Step 1: Get all test accounts
    const testAccounts = [
      { email: 'ari@gmail.com', password: 'password123', role: 'customer' },
      // Add more customer accounts if available
    ];

    console.log('1️⃣ Collecting bookings from all customer accounts...');

    // Step 2: Login as each customer and collect their bookings
    for (const account of testAccounts) {
      try {
        console.log(`🔍 Checking bookings for ${account.email}...`);
        
        // Login as customer
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
        
        if (loginData.success) {
          // Get customer bookings
          const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
            method: 'GET',
            credentials: 'include'
          });

          const bookingsData = await bookingsResponse.json();
          
          if (bookingsData.success && bookingsData.data) {
            console.log(`   ✅ Found ${bookingsData.data.length} bookings for ${account.email}`);
            
            // Add customer info to each booking
            const customerBookings = bookingsData.data.map(booking => ({
              ...booking,
              _source_customer: account.email,
              _source_role: account.role
            }));
            
            allBookings.push(...customerBookings);
          } else {
            console.log(`   ℹ️ No bookings found for ${account.email}`);
          }
        } else {
          console.log(`   ❌ Login failed for ${account.email}`);
          errors.push(`Login failed for ${account.email}: ${loginData.error}`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing ${account.email}:`, error.message);
        errors.push(`Error processing ${account.email}: ${error.message}`);
      }
    }

    // Step 3: Login as staff and verify access
    console.log('\n2️⃣ Testing staff access to aggregated data...');
    
    const staffAccounts = [
      { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manajer_futsal' },
      { email: 'kasir1@futsalapp.com', password: 'password123', role: 'staff_kasir' },
      { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor_sistem' }
    ];

    const staffResults = {};

    for (const staff of staffAccounts) {
      try {
        console.log(`🔍 Testing ${staff.role}: ${staff.email}...`);
        
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
          console.log(`   ✅ Staff login successful: ${loginData.user.name}`);
          
          // Test if staff can access customer bookings endpoint
          const bookingsResponse = await fetch(`${apiUrl}/customer/bookings`, {
            method: 'GET',
            credentials: 'include'
          });

          const bookingsData = await bookingsResponse.json();
          
          staffResults[staff.role] = {
            login_success: true,
            user: loginData.user,
            can_access_customer_endpoint: bookingsResponse.ok,
            bookings_visible: bookingsData.success ? bookingsData.data?.length || 0 : 0,
            endpoint_response: bookingsData
          };

          console.log(`   📊 ${staff.role} can see ${staffResults[staff.role].bookings_visible} bookings`);
          
        } else {
          staffResults[staff.role] = {
            login_success: false,
            error: loginData.error
          };
          console.log(`   ❌ Staff login failed: ${loginData.error}`);
        }

      } catch (error) {
        staffResults[staff.role] = {
          login_success: false,
          error: error.message
        };
        console.error(`   ❌ Error testing ${staff.role}:`, error.message);
      }
    }

    // Step 4: Generate comprehensive report
    console.log('\n3️⃣ Generating Comprehensive Report...');
    generateWorkaroundReport(allBookings, staffResults, errors);

    return {
      success: true,
      total_bookings_found: allBookings.length,
      staff_results: staffResults,
      all_bookings: allBookings,
      errors
    };

  } catch (error) {
    console.error('❌ Workaround failed:', error);
    return {
      success: false,
      error: error.message,
      total_bookings_found: allBookings.length,
      errors
    };
  }
}

/**
 * Generate comprehensive workaround report
 */
function generateWorkaroundReport(allBookings, staffResults, errors) {
  console.log('\n📊 STAFF BOOKING WORKAROUND REPORT');
  console.log('='.repeat(60));
  
  // Booking Collection Summary
  console.log('\n📋 BOOKING COLLECTION SUMMARY:');
  console.log(`   Total bookings found: ${allBookings.length}`);
  
  if (allBookings.length > 0) {
    const bookingsByCustomer = allBookings.reduce((acc, booking) => {
      const customer = booking._source_customer;
      acc[customer] = (acc[customer] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   Bookings by customer:');
    Object.entries(bookingsByCustomer).forEach(([customer, count]) => {
      console.log(`     ${customer}: ${count} bookings`);
    });
    
    // Show sample booking
    console.log('\n   Sample booking:');
    const sample = allBookings[0];
    console.log(`     ID: ${sample.id}, Status: ${sample.status}, Customer: ${sample.name}`);
    console.log(`     Date: ${sample.date}, Time: ${sample.start_time}-${sample.end_time}`);
  }
  
  // Staff Access Results
  console.log('\n👥 STAFF ACCESS RESULTS:');
  Object.entries(staffResults).forEach(([role, result]) => {
    console.log(`\n   ${role.toUpperCase()}:`);
    if (result.login_success) {
      console.log(`     ✅ Login: Success (${result.user?.name})`);
      console.log(`     🌐 Can access customer endpoint: ${result.can_access_customer_endpoint ? 'YES' : 'NO'}`);
      console.log(`     📊 Bookings visible: ${result.bookings_visible}`);
      
      if (result.bookings_visible === 0 && allBookings.length > 0) {
        console.log(`     ⚠️ ISSUE: Staff cannot see existing bookings!`);
      } else if (result.bookings_visible > 0) {
        console.log(`     ✅ Staff can see bookings successfully`);
      }
    } else {
      console.log(`     ❌ Login: Failed (${result.error})`);
    }
  });
  
  // Error Summary
  if (errors.length > 0) {
    console.log('\n❌ ERRORS ENCOUNTERED:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  // Analysis & Recommendations
  console.log('\n🔍 ANALYSIS:');
  
  const staffCanSeeBookings = Object.values(staffResults)
    .filter(r => r.login_success && r.bookings_visible > 0).length;
  const totalStaffTested = Object.keys(staffResults).length;
  
  if (allBookings.length === 0) {
    console.log('   ⚠️ No customer bookings found in system');
    console.log('   💡 Recommendation: Create test bookings first');
  } else if (staffCanSeeBookings === 0) {
    console.log('   🚨 CRITICAL: Staff cannot see any customer bookings');
    console.log('   💡 Root cause: Customer endpoint only shows bookings for logged-in user');
    console.log('   💡 Solution needed: Implement proper staff booking endpoint');
  } else if (staffCanSeeBookings < totalStaffTested) {
    console.log('   ⚠️ PARTIAL: Some staff roles cannot see bookings');
    console.log('   💡 Check role permissions and endpoint access');
  } else {
    console.log('   ✅ SUCCESS: All staff can see bookings');
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   1. Backend needs dedicated staff booking endpoint');
  console.log('   2. Staff endpoint should return ALL bookings, not user-filtered');
  console.log('   3. Implement proper role-based access control');
  console.log('   4. Deploy backend changes to production');
}

/**
 * Quick test function for immediate debugging
 */
async function quickStaffBookingTest() {
  console.log('⚡ Quick Staff Booking Test...\n');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // Test 1: Login as customer and check bookings
    console.log('1️⃣ Customer Test...');
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
      const customerBookings = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });
      const customerBookingsData = await customerBookings.json();
      console.log(`   Customer has ${customerBookingsData.data?.length || 0} bookings`);
    }

    // Test 2: Login as manager and check access
    console.log('\n2️⃣ Manager Test...');
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
      console.log(`   Manager login: ${managerData.user.name} (${managerData.user.role})`);
      
      const managerBookings = await fetch(`${apiUrl}/customer/bookings`, {
        method: 'GET',
        credentials: 'include'
      });
      const managerBookingsData = await managerBookings.json();
      console.log(`   Manager can see ${managerBookingsData.data?.length || 0} bookings`);
      
      if (managerBookingsData.data?.length === 0) {
        console.log('   🚨 CONFIRMED: Manager cannot see customer bookings!');
        console.log('   💡 This confirms the customer endpoint filters by user_id');
      }
    }

  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getStaffBookingsWorkaround = getStaffBookingsWorkaround;
  window.quickStaffBookingTest = quickStaffBookingTest;
}

export { getStaffBookingsWorkaround, quickStaffBookingTest };
