// debug/immediate-login-test.js
// Immediate Login Test untuk Verifikasi Perbaikan

console.log('🔧 Immediate Login Test Loaded');

async function immediateLoginTest() {
  console.log('🔍 Testing Login After Fixes...\n');

  try {
    // Clear any existing auth data
    localStorage.removeItem('auth_token');
    console.log('🧹 Cleared existing auth data');

    // Test 1: Environment Check
    console.log('1️⃣ Environment Check:');
    console.log(`   API URL: ${import.meta.env.VITE_API_URL}`);
    console.log(`   Mode: ${import.meta.env.MODE}`);
    console.log(`   Dev: ${import.meta.env.DEV}`);

    // Test 2: Import and test authAPI
    console.log('\n2️⃣ Testing authAPI.loginUser():');
    
    const { loginUser } = await import('../src/api/authAPI.js');
    
    const credentials = {
      email: 'ari@gmail.com',
      password: 'password123'
    };

    console.log('🔐 Attempting login with:', credentials.email);
    
    const result = await loginUser(credentials);
    
    console.log('📥 Login Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   User: ${result.user?.name} (${result.user?.role})`);

    // Test 3: Check token storage
    console.log('\n3️⃣ Token Storage Check:');
    const storedToken = localStorage.getItem('auth_token');
    console.log(`   Token Stored: ${storedToken ? 'YES' : 'NO'}`);
    if (storedToken) {
      console.log(`   Token Length: ${storedToken.length}`);
    }

    // Test 4: Test AuthProvider login
    console.log('\n4️⃣ Testing AuthProvider login flow:');
    
    // Clear token for fresh test
    localStorage.removeItem('auth_token');
    
    // Simulate AuthProvider login
    try {
      const authResult = await loginUser(credentials);
      if (authResult.success) {
        console.log('✅ AuthProvider flow would succeed');
        console.log(`   User: ${authResult.user.name}`);
        console.log(`   Role: ${authResult.user.role}`);
        
        // Check redirect logic
        const role = authResult.user.role;
        let redirectPath = '/';
        
        if (role === 'penyewa') {
          redirectPath = '/';
        } else if (['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'].includes(role)) {
          redirectPath = '/staff';
        }
        
        console.log(`   Would redirect to: ${redirectPath}`);
        
        return {
          success: true,
          user: authResult.user,
          redirectPath,
          tokenStored: !!localStorage.getItem('auth_token')
        };
      } else {
        console.log('❌ AuthProvider flow would fail');
        console.log(`   Error: ${authResult.error}`);
        return {
          success: false,
          error: authResult.error
        };
      }
    } catch (error) {
      console.error('❌ AuthProvider flow error:', error);
      return {
        success: false,
        error: error.message,
        details: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }

  } catch (error) {
    console.error('❌ Immediate test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test all accounts
async function testAllAccounts() {
  console.log('🔍 Testing All User Accounts...\n');

  const accounts = [
    { email: 'ari@gmail.com', password: 'password123', role: 'customer' },
    { email: 'kasir1@futsalapp.com', password: 'password123', role: 'kasir' },
    { email: 'manajer1@futsalapp.com', password: 'password123', role: 'manager' },
    { email: 'pweb@futsalapp.com', password: 'password123', role: 'supervisor' }
  ];

  const results = [];

  for (const account of accounts) {
    try {
      console.log(`🔐 Testing ${account.role}: ${account.email}`);
      
      // Clear previous auth
      localStorage.removeItem('auth_token');
      
      const { loginUser } = await import('../src/api/authAPI.js');
      const result = await loginUser({
        email: account.email,
        password: account.password
      });

      console.log(`   Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (result.success) {
        console.log(`   User: ${result.user.name} (${result.user.role})`);
      } else {
        console.log(`   Error: ${result.error}`);
      }

      results.push({
        ...account,
        success: result.success,
        user: result.user,
        error: result.error
      });

    } catch (error) {
      console.error(`❌ ${account.role} test failed:`, error.message);
      results.push({
        ...account,
        success: false,
        error: error.message
      });
    }
  }

  console.log('\n📊 All Accounts Test Summary:');
  results.forEach(r => {
    console.log(`   ${r.success ? '✅' : '❌'} ${r.role}: ${r.email}`);
  });

  const allSuccess = results.every(r => r.success);
  console.log(`\n🎯 Overall: ${allSuccess ? '✅ ALL ACCOUNTS WORKING' : '❌ SOME ACCOUNTS FAILED'}`);

  return results;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.immediateLoginTest = immediateLoginTest;
  window.testAllAccounts = testAllAccounts;
}

export { immediateLoginTest, testAllAccounts };
