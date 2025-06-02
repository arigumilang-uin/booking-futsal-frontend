// debug/api-test.js - API Testing Script untuk debugging booking issues

const API_BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Function to extract token from Set-Cookie header
function extractTokenFromCookie(setCookieHeader) {
  if (!setCookieHeader) return null;

  const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
  if (tokenCookie) {
    return tokenCookie.split('token=')[1].split(';')[0];
  }
  return null;
}

// Function to create test booking
async function createTestBooking(token) {
  try {
    // First get available fields
    console.log('📋 Getting available fields...');
    const fieldsResponse = await fetch(`${API_BASE_URL}/public/fields`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const fieldsData = await fieldsResponse.json();
    console.log('Available Fields:', fieldsData.data?.length || 0);

    if (fieldsData.success && fieldsData.data && fieldsData.data.length > 0) {
      const testBooking = {
        field_id: fieldsData.data[0].id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        start_time: "10:00",
        end_time: "11:00",
        name: "Test Customer",
        phone: "081234567890",
        email: "test@example.com",
        notes: "Test booking from API debug"
      };

      console.log('Creating test booking:', testBooking);

      const createResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testBooking)
      });

      const createData = await createResponse.json();
      console.log('Create Booking Response:', createData);

      if (createData.success) {
        console.log('✅ Test booking created successfully!');
        return createData.data;
      } else {
        console.log('❌ Failed to create test booking:', createData.error);
      }
    } else {
      console.log('❌ No fields available for booking');
    }
  } catch (error) {
    console.error('❌ Error creating test booking:', error);
  }
}

// Test function untuk login dan get bookings
async function testBookingAPI() {
  console.log('🔍 Starting API Integration Testing...\n');

  try {
    // Step 1: Test Login
    console.log('1️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.error);
    }

    console.log('✅ Login successful!');

    // Extract token from response body (development) or Set-Cookie header (production)
    let token = loginData.token;
    if (!token) {
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        token = extractTokenFromCookie([setCookieHeader]);
        console.log('🔑 Token extracted from Set-Cookie header');
      }
    } else {
      console.log('🔑 Token found in response body');
    }

    console.log('Token available:', token ? 'YES' : 'NO');
    console.log('\n');

    // Step 2: Test Get Customer Bookings with cookies
    console.log('2️⃣ Testing Get Customer Bookings with cookies...');
    const bookingsResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Include cookies for authentication
    });

    console.log('Bookings Response Status:', bookingsResponse.status);
    console.log('Bookings Response Headers:', Object.fromEntries(bookingsResponse.headers.entries()));

    const bookingsData = await bookingsResponse.json();
    console.log('Bookings Response Data:', JSON.stringify(bookingsData, null, 2));

    if (!bookingsData.success) {
      console.log('❌ Cookie authentication failed, trying with Authorization header...\n');

      // Step 2b: Test with Authorization header if token is available
      if (token) {
        console.log('2️⃣b Testing Get Customer Bookings with Authorization header...');
        const bookingsResponseAuth = await fetch(`${API_BASE_URL}/customer/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Auth Bookings Response Status:', bookingsResponseAuth.status);
        const bookingsDataAuth = await bookingsResponseAuth.json();
        console.log('Auth Bookings Response Data:', JSON.stringify(bookingsDataAuth, null, 2));

        if (!bookingsDataAuth.success) {
          console.log('❌ Authorization header also failed:', bookingsDataAuth.error);

          // Step 3: Try creating a test booking first
          console.log('\n3️⃣ No bookings found, creating test booking...');
          await createTestBooking(token);

          // Re-test get bookings after creating one
          console.log('\n4️⃣ Re-testing Get Bookings after creation...');
          const newBookingsResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          const newBookingsData = await newBookingsResponse.json();
          console.log('New Bookings Count:', newBookingsData.data?.length || 0);
          console.log('New Bookings Data:', JSON.stringify(newBookingsData, null, 2));

          return;
        }

        console.log('✅ Authorization header authentication successful!');
        console.log(`📊 Found ${bookingsDataAuth.data?.length || 0} bookings`);

        // Use the successful response for further analysis
        if (bookingsDataAuth.data && bookingsDataAuth.data.length > 0) {
          console.log('\n3️⃣ Analyzing Booking Data Structure...');
          const firstBooking = bookingsDataAuth.data[0];
          console.log('First Booking Structure:', Object.keys(firstBooking));
          console.log('First Booking Sample:', JSON.stringify(firstBooking, null, 2));
        } else {
          console.log('\n3️⃣ No bookings found, creating test booking...');
          await createTestBooking(token);
        }
        return; // Exit successfully
      } else {
        throw new Error('Get bookings failed: ' + bookingsData.error);
      }
    }

    console.log('✅ Get bookings successful!');
    console.log(`📊 Found ${bookingsData.data?.length || 0} bookings`);

    // Step 3: Analyze booking data structure
    if (bookingsData.data && bookingsData.data.length > 0) {
      console.log('\n3️⃣ Analyzing Booking Data Structure...');
      const firstBooking = bookingsData.data[0];
      console.log('First Booking Structure:', Object.keys(firstBooking));
      console.log('First Booking Sample:', JSON.stringify(firstBooking, null, 2));
    } else {
      console.log('\n⚠️ No booking data found - this might be the issue!');
    }

    // Step 4: Test Create Booking (if no bookings exist)
    if (!bookingsData.data || bookingsData.data.length === 0) {
      console.log('\n4️⃣ Testing Create Booking...');
      
      // First get available fields
      const fieldsResponse = await fetch(`${API_BASE_URL}/public/fields`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const fieldsData = await fieldsResponse.json();
      console.log('Available Fields:', fieldsData.data?.length || 0);

      if (fieldsData.success && fieldsData.data && fieldsData.data.length > 0) {
        const testBooking = {
          field_id: fieldsData.data[0].id,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
          start_time: "10:00",
          end_time: "11:00",
          name: "Test Customer",
          phone: "081234567890",
          email: "test@example.com",
          notes: "Test booking from API debug"
        };

        console.log('Creating test booking:', testBooking);

        const createResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(testBooking)
        });

        const createData = await createResponse.json();
        console.log('Create Booking Response:', createData);

        if (createData.success) {
          console.log('✅ Test booking created successfully!');
          
          // Re-test get bookings
          console.log('\n5️⃣ Re-testing Get Bookings after creation...');
          const newBookingsResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });

          const newBookingsData = await newBookingsResponse.json();
          console.log('New Bookings Count:', newBookingsData.data?.length || 0);
          console.log('New Bookings Data:', JSON.stringify(newBookingsData, null, 2));
        }
      }
    }

  } catch (error) {
    console.error('❌ API Test Error:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testBookingAPI();
