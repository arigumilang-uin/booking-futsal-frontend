// debug/cookie-auth-test.js
// Test cookie-based authentication for production backend

console.log('🍪 Cookie Authentication Test Loaded');

/**
 * Test cookie-based authentication flow
 */
async function testCookieAuthentication() {
  console.log('🍪 Testing Cookie-Based Authentication...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // Step 1: Login with credentials (should set cookie)
    console.log('1️⃣ Testing Login with Cookie...');
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        email: 'manajer1@futsalapp.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    // Check if cookies were set
    const cookies = document.cookie;
    console.log('Cookies after login:', cookies);

    if (!loginData.success) {
      console.log('❌ Login failed');
      return { success: false, error: 'Login failed' };
    }

    // Step 2: Test authenticated request with cookies
    console.log('\n2️⃣ Testing Authenticated Request with Cookies...');
    const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
      method: 'GET',
      credentials: 'include' // Use cookies for auth
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile fetch with cookies successful:', profileData.user?.name);
    } else {
      console.log('❌ Profile fetch with cookies failed:', profileResponse.status);
    }

    // Step 3: Test admin bookings endpoint with cookies
    console.log('\n3️⃣ Testing Admin Bookings with Cookies...');
    const bookingsResponse = await fetch(`${apiUrl}/admin/bookings`, {
      method: 'GET',
      credentials: 'include'
    });

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      console.log('✅ Admin bookings fetch successful:', bookingsData.data?.length, 'bookings');
      return {
        success: true,
        bookingsCount: bookingsData.data?.length || 0,
        authMethod: 'cookies'
      };
    } else {
      console.log('❌ Admin bookings fetch failed:', bookingsResponse.status);
      const errorData = await bookingsResponse.text();
      console.log('Error details:', errorData);
      return {
        success: false,
        error: `HTTP ${bookingsResponse.status}`,
        authMethod: 'cookies'
      };
    }

  } catch (error) {
    console.error('❌ Cookie authentication test failed:', error);
    return {
      success: false,
      error: error.message,
      authMethod: 'cookies'
    };
  }
}

/**
 * Test hybrid authentication (cookies + token fallback)
 */
async function testHybridAuthentication() {
  console.log('🔄 Testing Hybrid Authentication (Cookies + Token)...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // Step 1: Login and get token from refresh endpoint
    console.log('1️⃣ Login and get token from refresh...');
    
    // First login to set cookie
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
      return { success: false, error: 'Login failed' };
    }

    // Try to get token from refresh endpoint
    const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    let token = null;
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      token = refreshData.token;
      console.log('✅ Token obtained from refresh:', token ? 'Available' : 'Not available');
    }

    // Step 2: Test with Authorization header
    if (token) {
      console.log('\n2️⃣ Testing with Authorization Header...');
      const bookingsResponse = await fetch(`${apiUrl}/admin/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('✅ Admin bookings with token successful:', bookingsData.data?.length, 'bookings');
        
        // Store token for frontend use
        localStorage.setItem('auth_token', token);
        console.log('🔑 Token stored in localStorage');
        
        return {
          success: true,
          bookingsCount: bookingsData.data?.length || 0,
          authMethod: 'token',
          token: token
        };
      } else {
        console.log('❌ Admin bookings with token failed:', bookingsResponse.status);
      }
    }

    // Fallback to cookie-based auth
    console.log('\n3️⃣ Fallback to Cookie-based Auth...');
    return await testCookieAuthentication();

  } catch (error) {
    console.error('❌ Hybrid authentication test failed:', error);
    return {
      success: false,
      error: error.message,
      authMethod: 'hybrid'
    };
  }
}

/**
 * Test customer booking creation and staff visibility
 */
async function testBookingSynchronization() {
  console.log('🔄 Testing Booking Synchronization...\n');

  const apiUrl = import.meta.env.VITE_API_URL;
  
  try {
    // Step 1: Login as customer
    console.log('1️⃣ Login as Customer...');
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
    if (!customerData.success) {
      return { success: false, error: 'Customer login failed' };
    }

    // Step 2: Create booking as customer
    console.log('2️⃣ Creating Booking as Customer...');
    const bookingData = {
      field_id: 1,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: "16:00",
      end_time: "17:00",
      name: "Test Sync Booking",
      phone: "081234567890",
      notes: "Test booking for synchronization"
    };

    const createResponse = await fetch(`${apiUrl}/customer/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bookingData)
    });

    const createResult = await createResponse.json();
    if (!createResult.success) {
      console.log('❌ Booking creation failed:', createResult.error);
      return { success: false, error: 'Booking creation failed' };
    }

    console.log('✅ Booking created:', createResult.data?.id);
    const bookingId = createResult.data?.id;

    // Step 3: Login as staff and check visibility
    console.log('\n3️⃣ Login as Staff and Check Booking Visibility...');
    const staffLogin = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'manajer1@futsalapp.com',
        password: 'password123'
      })
    });

    const staffData = await staffLogin.json();
    if (!staffData.success) {
      return { success: false, error: 'Staff login failed' };
    }

    // Step 4: Check if booking is visible to staff
    const staffBookingsResponse = await fetch(`${apiUrl}/admin/bookings`, {
      method: 'GET',
      credentials: 'include'
    });

    if (staffBookingsResponse.ok) {
      const staffBookings = await staffBookingsResponse.json();
      const bookingVisible = staffBookings.data?.some(b => b.id === bookingId);
      
      console.log(`✅ Staff can see ${staffBookings.data?.length || 0} total bookings`);
      console.log(`${bookingVisible ? '✅' : '❌'} New booking ${bookingVisible ? 'IS' : 'IS NOT'} visible to staff`);
      
      return {
        success: true,
        bookingCreated: bookingId,
        totalStaffBookings: staffBookings.data?.length || 0,
        bookingVisible,
        syncStatus: bookingVisible ? 'synchronized' : 'out_of_sync'
      };
    } else {
      console.log('❌ Staff cannot access bookings:', staffBookingsResponse.status);
      return {
        success: false,
        error: `Staff booking access failed: HTTP ${staffBookingsResponse.status}`
      };
    }

  } catch (error) {
    console.error('❌ Booking synchronization test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testCookieAuthentication = testCookieAuthentication;
  window.testHybridAuthentication = testHybridAuthentication;
  window.testBookingSynchronization = testBookingSynchronization;
}

export { testCookieAuthentication, testHybridAuthentication, testBookingSynchronization };
