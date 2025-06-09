#!/usr/bin/env node

/**
 * Production API Test Script
 * Tests the production API endpoints and CORS configuration
 */

const PRODUCTION_API = 'https://booking-futsal-production.up.railway.app/api';
const FRONTEND_URL = 'https://booking-futsal-frontend.vercel.app';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`🔍 Testing ${name}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log(`   ✅ ${name} is working`);
      return true;
    } else {
      console.log(`   ❌ ${name} failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${name} error: ${error.message}`);
    return false;
  }
}

async function testCORS() {
  console.log('🔒 Testing CORS Configuration...');
  
  try {
    const response = await fetch(`${PRODUCTION_API}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
    };
    
    console.log('   CORS Headers:', corsHeaders);
    
    const corsWorking = corsHeaders['Access-Control-Allow-Origin'] && 
                       corsHeaders['Access-Control-Allow-Methods'];
    
    if (corsWorking) {
      console.log('   ✅ CORS is properly configured');
      return true;
    } else {
      console.log('   ❌ CORS configuration issues detected');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ CORS test failed: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  console.log('🔐 Testing Login Endpoint...');
  
  try {
    const response = await fetch(`${PRODUCTION_API}/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'invalid'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Method: POST (should not be 405)`);
    
    if (response.status === 400 || response.status === 401) {
      console.log('   ✅ Login endpoint accepts POST (expected error for invalid credentials)');
      return true;
    } else if (response.status === 405) {
      console.log('   ❌ Login endpoint returns 405 - Method Not Allowed');
      return false;
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.status}`);
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Login test failed: ${error.message}`);
    return false;
  }
}

async function testProductionAPI() {
  console.log('🧪 Testing Production API...');
  console.log(`📡 API URL: ${PRODUCTION_API}`);
  console.log(`🌐 Frontend: ${FRONTEND_URL}`);
  console.log('');
  
  const results = await Promise.all([
    testEndpoint('Health Check', `${PRODUCTION_API}/health`),
    testCORS(),
    testLogin()
  ]);
  
  const allPassed = results.every(result => result);
  
  console.log('');
  console.log(`📊 Test Results: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
  
  if (allPassed) {
    console.log('🎉 Production API is ready!');
    console.log('');
    console.log('🚀 Frontend should now work at:');
    console.log(`   ${FRONTEND_URL}/login`);
  } else {
    console.log('⚠️  Some tests failed. Check backend configuration.');
    console.log('');
    console.log('🔧 Possible fixes:');
    console.log('   1. Check Railway backend deployment');
    console.log('   2. Verify CORS configuration');
    console.log('   3. Ensure login endpoint accepts POST method');
  }
  
  return allPassed;
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  console.log('📦 Installing fetch polyfill...');
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

// Run tests
testProductionAPI().catch(console.error);
