// Test Script: Create Bookings with Pending Payments
// This script creates test bookings to generate pending payments for kasir testing

import axios from 'axios';

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const testCredentials = {
  customer: { email: 'ppwweebb05@gmail.com', password: 'futsaluas' }
};

let authCookies = {};

// Create axios instance with cookie support
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login function
async function login(role, credentials) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/auth/login`, credentials);

    if (response.data.success) {
      // Extract cookies from response headers
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        authCookies[role] = cookies;
        console.log(`✅ ${role} login successful`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ ${role} login failed:`, error.response?.data || error.message);
    return false;
  }
}

// Get available fields
async function getAvailableFields() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/customer/fields`, {
      headers: {
        'Cookie': authCookies.customer?.join('; ') || ''
      }
    });

    if (response.data.success && response.data.data.length > 0) {
      console.log(`✅ Found ${response.data.data.length} available fields`);
      return response.data.data[0]; // Return first available field
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get fields:', error.response?.data || error.message);
    return null;
  }
}

// Create test booking
async function createTestBooking(fieldId, testNumber) {
  try {
    // Use future dates to avoid conflicts
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + testNumber + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Use different time slots for each test
    const startHour = 10 + (testNumber * 2); // 10, 12, 14, 16
    const endHour = startHour + 2;

    const bookingData = {
      field_id: fieldId,
      date: dateStr,
      start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
      end_time: `${endHour.toString().padStart(2, '0')}:00:00`,
      name: `Test Booking ${testNumber}`,
      phone: '081234567890',
      email: 'test@example.com',
      notes: `Test booking ${testNumber} for kasir payment testing`
    };

    console.log(`📅 Creating test booking ${testNumber}:`, {
      field_id: fieldId,
      date: dateStr,
      time: `${startHour}:00 - ${endHour}:00`
    });

    const response = await axiosInstance.post(`${BASE_URL}/customer/bookings`, bookingData, {
      headers: {
        'Cookie': authCookies.customer?.join('; ') || ''
      }
    });

    if (response.data.success) {
      const booking = response.data.data;
      console.log(`✅ Test booking ${testNumber} created:`, {
        id: booking.id,
        booking_number: booking.booking_number,
        total_amount: booking.total_amount,
        status: booking.status,
        payment_status: booking.payment_status
      });
      return booking;
    }
    return null;
  } catch (error) {
    console.error(`❌ Failed to create test booking ${testNumber}:`, error.response?.data || error.message);
    return null;
  }
}

// Create payment for booking
async function createPaymentForBooking(bookingId, testNumber) {
  try {
    const paymentData = {
      method: 'bank_transfer',
      amount: 105000, // Standard amount
      currency: 'IDR'
    };

    console.log(`💳 Creating payment for booking ${bookingId}...`);

    const response = await axiosInstance.post(`${BASE_URL}/customer/bookings/${bookingId}/payment`, paymentData, {
      headers: {
        'Cookie': authCookies.customer?.join('; ') || ''
      }
    });

    if (response.data.success) {
      const payment = response.data.data;
      console.log(`✅ Payment ${testNumber} created:`, {
        id: payment.id,
        payment_number: payment.payment_number,
        amount: payment.amount,
        method: payment.method,
        status: payment.status
      });
      return payment;
    }
    return null;
  } catch (error) {
    console.error(`❌ Failed to create payment for booking ${bookingId}:`, error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function createTestData() {
  console.log('🚀 Starting test data creation for kasir payment testing...\n');

  // Step 1: Login as customer
  console.log('📝 Step 1: Login as customer...');
  const customerLoginSuccess = await login('customer', testCredentials.customer);
  if (!customerLoginSuccess) {
    console.log('❌ Customer login failed. Exiting...');
    return;
  }

  // Step 2: Get available fields
  console.log('\n📝 Step 2: Get available fields...');
  const availableField = await getAvailableFields();
  if (!availableField) {
    console.log('❌ No available fields found. Exiting...');
    return;
  }

  console.log(`✅ Using field: ${availableField.name} (ID: ${availableField.id})`);

  // Step 3: Create multiple test bookings with payments
  console.log('\n📝 Step 3: Creating test bookings with pending payments...');

  const testResults = [];

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Creating Test Booking ${i} ---`);

    // Create booking
    const booking = await createTestBooking(availableField.id, i);
    if (!booking) {
      console.log(`❌ Failed to create booking ${i}`);
      continue;
    }

    // Create payment for booking
    const payment = await createPaymentForBooking(booking.id, i);
    if (!payment) {
      console.log(`❌ Failed to create payment for booking ${i}`);
      continue;
    }

    testResults.push({
      booking: booking,
      payment: payment
    });

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 4: Summary
  console.log('\n📊 TEST DATA CREATION SUMMARY:');
  console.log('=====================================');
  console.log(`✅ Successfully created ${testResults.length} test bookings with pending payments`);

  testResults.forEach((result, index) => {
    console.log(`\n📋 Test ${index + 1}:`);
    console.log(`   Booking: #${result.booking.booking_number} (ID: ${result.booking.id})`);
    console.log(`   Payment: #${result.payment.payment_number} (ID: ${result.payment.id})`);
    console.log(`   Amount: Rp ${result.payment.amount.toLocaleString('id-ID')}`);
    console.log(`   Status: ${result.payment.status} (should be 'pending')`);
  });

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Login as kasir (ppwweebb04@gmail.com/futsaluas)');
  console.log('2. Go to Payment tab');
  console.log('3. You should now see pending payments to confirm');
  console.log('4. Test payment confirmation workflow');

  return testResults;
}

// Run the test
createTestData().catch(console.error);
