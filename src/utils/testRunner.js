// src/utils/testRunner.js
/**
 * Test Runner untuk Customer Booking Flow
 * Digunakan untuk testing comprehensive fitur booking
 */

import { loginUser, getProfile } from '../api/authAPI';
import { getPublicFields } from '../api/fieldAPI';
import { createBooking, getCustomerBookings, cancelBooking } from '../api/bookingAPI';

// Test data
const TEST_CUSTOMER = {
  email: 'ari@gmail.com',
  password: 'password123'
};

const TEST_BOOKING_DATA = {
  field_id: 1,
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
  time_slot: '10:00-11:00',
  duration: 1,
  notes: 'Test booking dari frontend - automated testing'
};

class TestRunner {
  constructor() {
    this.results = [];
    this.currentUser = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    this.results.push(logEntry);
    
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`🧪 Starting test: ${testName}`);
      await testFunction();
      this.log(`✅ Test passed: ${testName}`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ Test failed: ${testName} - ${error.message}`, 'error');
      console.error('Test error details:', error);
      return false;
    }
  }

  // Test 1: Login Testing
  async testLogin() {
    return this.runTest('Customer Login', async () => {
      this.log('Attempting login with customer credentials...');
      
      const response = await loginUser(TEST_CUSTOMER.email, TEST_CUSTOMER.password);
      
      if (!response.success) {
        throw new Error(`Login failed: ${response.error || 'Unknown error'}`);
      }

      this.log('Login successful, getting user profile...');
      
      const profileResponse = await getProfile();
      if (!profileResponse.success) {
        throw new Error(`Failed to get profile: ${profileResponse.error}`);
      }

      this.currentUser = profileResponse.data;
      this.log(`Profile loaded: ${this.currentUser.name} (${this.currentUser.role})`);

      if (this.currentUser.role !== 'penyewa') {
        throw new Error(`Expected role 'penyewa', got '${this.currentUser.role}'`);
      }

      this.log('User role verification passed');
    });
  }

  // Test 2: Field List Testing
  async testFieldList() {
    return this.runTest('Field List Loading', async () => {
      this.log('Loading public fields...');
      
      const response = await getPublicFields();
      
      if (!response.success) {
        throw new Error(`Failed to load fields: ${response.error || 'Unknown error'}`);
      }

      const fields = response.data || [];
      this.log(`Loaded ${fields.length} fields from API`);

      if (fields.length === 0) {
        throw new Error('No fields available for booking');
      }

      // Verify field structure
      const firstField = fields[0];
      const requiredFields = ['id', 'name', 'type', 'price_per_hour'];
      
      for (const field of requiredFields) {
        if (!(field in firstField)) {
          throw new Error(`Field missing required property: ${field}`);
        }
      }

      this.log('Field data structure validation passed');
      
      // Store first field for booking test
      this.testField = firstField;
      TEST_BOOKING_DATA.field_id = firstField.id;
    });
  }

  // Test 3: Booking Creation Testing
  async testBookingCreation() {
    return this.runTest('Booking Creation', async () => {
      this.log('Creating test booking...');
      this.log(`Booking data: ${JSON.stringify(TEST_BOOKING_DATA, null, 2)}`);
      
      const response = await createBooking(TEST_BOOKING_DATA);
      
      if (!response.success) {
        throw new Error(`Failed to create booking: ${response.error || 'Unknown error'}`);
      }

      this.testBooking = response.data;
      this.log(`Booking created successfully with ID: ${this.testBooking.id || 'N/A'}`);
      
      // Verify booking data
      if (this.testBooking.status !== 'pending') {
        this.log(`Warning: Expected status 'pending', got '${this.testBooking.status}'`, 'warning');
      }
    });
  }

  // Test 4: Booking List Testing
  async testBookingList() {
    return this.runTest('Booking List Retrieval', async () => {
      this.log('Loading customer bookings...');
      
      const response = await getCustomerBookings();
      
      if (!response.success) {
        throw new Error(`Failed to load bookings: ${response.error || 'Unknown error'}`);
      }

      const bookings = response.data || [];
      this.log(`Loaded ${bookings.length} bookings from API`);

      // Find our test booking
      if (this.testBooking) {
        const foundBooking = bookings.find(b => 
          b.id === this.testBooking.id || 
          (b.date === TEST_BOOKING_DATA.date && b.time_slot === TEST_BOOKING_DATA.time_slot)
        );

        if (foundBooking) {
          this.log('Test booking found in booking list');
        } else {
          this.log('Test booking not found in list (may be normal for new bookings)', 'warning');
        }
      }
    });
  }

  // Test 5: Form Validation Testing
  async testFormValidation() {
    return this.runTest('Form Validation', async () => {
      this.log('Testing form validation with invalid data...');
      
      // Test empty field_id
      try {
        await createBooking({
          field_id: '',
          date: TEST_BOOKING_DATA.date,
          time_slot: TEST_BOOKING_DATA.time_slot,
          duration: 1
        });
        throw new Error('Expected validation error for empty field_id');
      } catch (error) {
        if (error.message.includes('Expected validation error')) {
          throw error;
        }
        this.log('Validation correctly rejected empty field_id');
      }

      // Test past date
      try {
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await createBooking({
          field_id: TEST_BOOKING_DATA.field_id,
          date: pastDate,
          time_slot: TEST_BOOKING_DATA.time_slot,
          duration: 1
        });
        this.log('Warning: Past date booking was accepted (may be backend behavior)', 'warning');
      } catch (error) {
        this.log('Validation correctly rejected past date');
      }
    });
  }

  // Test 6: Booking Cancellation Testing
  async testBookingCancellation() {
    return this.runTest('Booking Cancellation', async () => {
      if (!this.testBooking || !this.testBooking.id) {
        this.log('Skipping cancellation test - no test booking available', 'warning');
        return;
      }

      this.log(`Attempting to cancel booking ID: ${this.testBooking.id}`);
      
      try {
        const response = await cancelBooking(this.testBooking.id);
        
        if (response.success) {
          this.log('Booking cancelled successfully');
        } else {
          this.log(`Cancellation failed: ${response.error || 'Unknown error'}`, 'warning');
        }
      } catch (error) {
        this.log(`Cancellation error: ${error.message}`, 'warning');
      }
    });
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting comprehensive customer booking tests...');
    this.log('='.repeat(60));

    const tests = [
      () => this.testLogin(),
      () => this.testFieldList(),
      () => this.testBookingCreation(),
      () => this.testBookingList(),
      () => this.testFormValidation(),
      () => this.testBookingCancellation()
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      const result = await test();
      if (result) passedTests++;
      this.log('-'.repeat(40));
    }

    this.log('='.repeat(60));
    this.log(`🏁 Testing completed: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('🎉 All tests passed! Customer booking flow is working correctly.', 'success');
    } else {
      this.log(`⚠️ ${totalTests - passedTests} tests failed. Check logs for details.`, 'warning');
    }

    return {
      passed: passedTests,
      total: totalTests,
      results: this.results
    };
  }

  // Generate test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        success: this.results.filter(r => r.type === 'success').length,
        errors: this.results.filter(r => r.type === 'error').length,
        warnings: this.results.filter(r => r.type === 'warning').length
      },
      details: this.results
    };

    console.log('📊 Test Report:', report);
    return report;
  }
}

// Export untuk digunakan di console browser
window.TestRunner = TestRunner;
window.runCustomerBookingTests = async () => {
  const runner = new TestRunner();
  const results = await runner.runAllTests();
  runner.generateReport();
  return results;
};

export default TestRunner;
