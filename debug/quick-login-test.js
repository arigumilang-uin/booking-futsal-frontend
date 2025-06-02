// debug/quick-login-test.js
// Quick Login Test untuk Immediate Troubleshooting

const API_BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

async function quickLoginTest() {
  console.log('🔍 Quick Login Test Starting...\n');

  try {
    // Step 1: Test Backend Health
    console.log('1️⃣ Testing Backend Health...');
    const healthResponse = await fetch(`${API_BASE_URL}/test/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend Health:', healthData.status);
    } else {
      console.log('❌ Backend Health Failed:', healthResponse.status);
    }

    // Step 2: Test Login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'ari@gmail.com',
        password: 'password123'
      })
    });

    console.log('Login Response Status:', loginResponse.status);
    
    const loginData = await loginResponse.json();
    console.log('Login Response Data:', loginData);

    if (loginData.success) {
      console.log('✅ Login Successful!');
      console.log('User:', loginData.user.name);
      console.log('Role:', loginData.user.role);
      
      // Check token
      if (loginData.token) {
        console.log('🔑 Token received in response');
        localStorage.setItem('auth_token', loginData.token);
        console.log('💾 Token stored in localStorage');
      } else {
        console.log('⚠️ No token in response body');
      }

      // Step 3: Test Authenticated Request
      console.log('\n3️⃣ Testing Authenticated Request...');
      const token = localStorage.getItem('auth_token');
      
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile fetch successful');
        console.log('Profile:', profileData.user.name);
      } else {
        console.log('❌ Profile fetch failed:', profileResponse.status);
      }

      // Step 4: Test Booking API
      console.log('\n4️⃣ Testing Booking API...');
      const bookingsResponse = await fetch(`${API_BASE_URL}/customer/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('✅ Bookings fetch successful');
        console.log('Bookings count:', bookingsData.data?.length || 0);
      } else {
        console.log('❌ Bookings fetch failed:', bookingsResponse.status);
        const errorData = await bookingsResponse.json();
        console.log('Error:', errorData.error);
      }

    } else {
      console.log('❌ Login Failed:', loginData.error);
    }

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.quickLoginTest = quickLoginTest;
}

console.log('🔍 Quick Login Test loaded! Run: quickLoginTest()');

export default quickLoginTest;
