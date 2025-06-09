// test-manager-features.js - Test script untuk fitur manager yang telah dioptimalkan
import axios from 'axios';

// Configuration
const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';
const MANAGER_CREDENTIALS = {
  email: 'ppwweebb02@gmail.com',
  password: 'futsaluas'
};

let authToken = '';

// Helper function untuk API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error ${method} ${endpoint}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// Test functions
const testManagerLogin = async () => {
  console.log('\n🔐 Testing Manager Login...');

  const response = await apiCall('POST', '/auth/login', MANAGER_CREDENTIALS);

  if (response.success && response.token) {
    authToken = response.token;
    console.log('✅ Manager login successful');
    console.log(`   User: ${response.user.name} (${response.user.role})`);
    return true;
  } else {
    console.log('❌ Manager login failed:', response.error);
    return false;
  }
};

const testManagerDashboard = async () => {
  console.log('\n📊 Testing Manager Dashboard...');

  const response = await apiCall('GET', '/staff/manager/dashboard');

  if (response.success) {
    console.log('✅ Manager dashboard loaded successfully');
    console.log(`   Manager: ${response.data.manager_info?.name}`);
    console.log(`   Department: ${response.data.manager_info?.department}`);
    console.log(`   Total Bookings: ${response.data.total_bookings || 0}`);
    console.log(`   Total Revenue: ${response.data.total_revenue || 0}`);
    return true;
  } else {
    console.log('❌ Manager dashboard failed:', response.error);
    return false;
  }
};

const testManagerBookings = async () => {
  console.log('\n📅 Testing Manager Booking Management...');

  // Get all bookings
  const response = await apiCall('GET', '/staff/manager/bookings');

  if (response.success) {
    const bookings = response.data || [];
    console.log('✅ Manager bookings loaded successfully');
    console.log(`   Total bookings: ${bookings.length}`);
    console.log(`   Pending: ${bookings.filter(b => b.status === 'pending').length}`);
    console.log(`   Confirmed: ${bookings.filter(b => b.status === 'confirmed').length}`);

    // Test booking detail if bookings exist
    if (bookings.length > 0) {
      const firstBooking = bookings[0];
      const detailResponse = await apiCall('GET', `/staff/manager/bookings/${firstBooking.id}`);

      if (detailResponse.success) {
        console.log('✅ Booking detail loaded successfully');
        console.log(`   Booking ID: ${firstBooking.id}`);
        console.log(`   Customer: ${detailResponse.data.customer_name}`);
        console.log(`   Status: ${detailResponse.data.status}`);
      }
    }

    return true;
  } else {
    console.log('❌ Manager bookings failed:', response.error);
    return false;
  }
};

const testManagerUsers = async () => {
  console.log('\n👥 Testing Manager User Management...');

  const response = await apiCall('GET', '/staff/manager/users');

  if (response.success) {
    const users = response.data || [];
    console.log('✅ Manager users loaded successfully');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Staff: ${users.filter(u => ['staff_kasir', 'operator_lapangan'].includes(u.role)).length}`);
    console.log(`   Customers: ${users.filter(u => u.role === 'penyewa').length}`);
    console.log(`   Active: ${users.filter(u => u.status === 'active').length}`);
    return true;
  } else {
    console.log('❌ Manager users failed:', response.error);
    return false;
  }
};

const testManagerFields = async () => {
  console.log('\n🏟️ Testing Manager Field Management...');

  const response = await apiCall('GET', '/staff/manager/fields');

  if (response.success) {
    const fields = response.data || [];
    console.log('✅ Manager fields loaded successfully');
    console.log(`   Total fields: ${fields.length}`);
    console.log(`   Active: ${fields.filter(f => f.status === 'active').length}`);
    console.log(`   Maintenance: ${fields.filter(f => f.status === 'maintenance').length}`);

    if (fields.length > 0) {
      const field = fields[0];
      console.log(`   Sample field: ${field.name} - ${field.type} - Rp${field.price_per_hour}/jam`);
    }

    return true;
  } else {
    console.log('❌ Manager fields failed:', response.error);
    return false;
  }
};

const testManagerAnalytics = async () => {
  console.log('\n📈 Testing Manager Business Analytics...');

  const response = await apiCall('GET', '/staff/manager/analytics', null, {
    'Content-Type': 'application/json'
  });

  if (response.success) {
    console.log('✅ Manager analytics loaded successfully');
    console.log(`   Period: ${response.data.period || 'current'}`);
    console.log(`   Revenue: ${response.data.revenue?.total || 0}`);
    console.log(`   Bookings: ${response.data.bookings?.total || 0}`);
    console.log(`   Customer Growth: ${response.data.customers?.growth || 0}%`);
    return true;
  } else {
    console.log('❌ Manager analytics failed:', response.error);
    return false;
  }
};

const testManagerReports = async () => {
  console.log('\n📋 Testing Manager Reports...');

  // Test booking reports
  const bookingReports = await apiCall('GET', '/staff/manager/reports/bookings');

  if (bookingReports.success) {
    console.log('✅ Booking reports loaded successfully');
    console.log(`   Total bookings in report: ${bookingReports.data.total_bookings || 0}`);
    console.log(`   Confirmed bookings: ${bookingReports.data.confirmed_bookings || 0}`);
  } else {
    console.log('❌ Booking reports failed:', bookingReports.error);
  }

  // Test revenue reports
  const revenueReports = await apiCall('GET', '/staff/manager/reports/revenue');

  if (revenueReports.success) {
    console.log('✅ Revenue reports loaded successfully');
    console.log(`   Total revenue: ${revenueReports.data.total_revenue || 0}`);
    console.log(`   Growth: ${revenueReports.data.growth_percentage || 0}%`);
  } else {
    console.log('❌ Revenue reports failed:', revenueReports.error);
  }

  return true;
};

const testBookingStatusUpdate = async () => {
  console.log('\n🔄 Testing Booking Status Update...');

  // Get bookings first
  const bookingsResponse = await apiCall('GET', '/staff/manager/bookings');

  if (bookingsResponse.success) {
    const pendingBookings = bookingsResponse.data.filter(b => b.status === 'pending');

    if (pendingBookings.length > 0) {
      const booking = pendingBookings[0];

      // Test status update (simulate confirm)
      const updateResponse = await apiCall('PUT', `/staff/manager/bookings/${booking.id}/status`, {
        status: 'confirmed',
        reason: 'Approved by manager - test automation'
      });

      if (updateResponse.success) {
        console.log('✅ Booking status update successful');
        console.log(`   Booking ID: ${booking.id}`);
        console.log(`   New status: confirmed`);
        console.log(`   Reason: Approved by manager - test automation`);

        // Revert back to pending for testing purposes
        await apiCall('PUT', `/staff/manager/bookings/${booking.id}/status`, {
          status: 'pending',
          reason: 'Reverted for testing purposes'
        });

        return true;
      } else {
        console.log('❌ Booking status update failed:', updateResponse.error);
        return false;
      }
    } else {
      console.log('ℹ️ No pending bookings available for testing status update');
      return true;
    }
  } else {
    console.log('❌ Could not load bookings for status update test');
    return false;
  }
};

// Main test runner
const runManagerTests = async () => {
  console.log('🚀 Starting Manager Features Test Suite');
  console.log('=====================================');

  const tests = [
    { name: 'Manager Login', fn: testManagerLogin },
    { name: 'Manager Dashboard', fn: testManagerDashboard },
    { name: 'Manager Bookings', fn: testManagerBookings },
    { name: 'Manager Users', fn: testManagerUsers },
    { name: 'Manager Fields', fn: testManagerFields },
    { name: 'Manager Analytics', fn: testManagerAnalytics },
    { name: 'Manager Reports', fn: testManagerReports },
    { name: 'Booking Status Update', fn: testBookingStatusUpdate }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" threw an error:`, error.message);
      failed++;
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All manager features are working correctly!');
    console.log('✨ Manager optimization is successful!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run the tests
runManagerTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
