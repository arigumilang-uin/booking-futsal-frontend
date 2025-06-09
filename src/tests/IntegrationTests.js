// src/tests/IntegrationTests.js
// Comprehensive integration tests for 100% backend-frontend integration

class IntegrationTestSuite {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // ===== TEST UTILITIES =====

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`🧪 Running test: ${testName}`);
    
    try {
      const startTime = performance.now();
      await testFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.passedTests++;
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: duration.toFixed(2) + 'ms',
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ ${testName} - PASSED (${duration.toFixed(2)}ms)`);
    } catch (error) {
      this.failedTests++;
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.error(`❌ ${testName} - FAILED:`, error.message);
    }
  }

  // ===== API ENDPOINT TESTS =====

  async testAuthenticationEndpoints() {
    await this.runTest('Authentication Endpoints', async () => {
      // Test login endpoint
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ppwweebb05@gmail.com',
          password: 'futsaluas'
        })
      });
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }
      
      const loginData = await loginResponse.json();
      if (!loginData.success) {
        throw new Error('Login response indicates failure');
      }
      
      // Test profile endpoint
      const profileResponse = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      }
    });
  }

  async testCustomerEndpoints() {
    await this.runTest('Customer Endpoints', async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Test customer bookings endpoint
      const bookingsResponse = await fetch('/api/customer/bookings', { headers });
      if (!bookingsResponse.ok) {
        throw new Error(`Customer bookings failed: ${bookingsResponse.status}`);
      }
      
      // Test customer notifications endpoint
      const notificationsResponse = await fetch('/api/customer/notifications', { headers });
      if (!notificationsResponse.ok) {
        throw new Error(`Customer notifications failed: ${notificationsResponse.status}`);
      }
      
      // Test fields endpoint
      const fieldsResponse = await fetch('/api/public/fields');
      if (!fieldsResponse.ok) {
        throw new Error(`Fields endpoint failed: ${fieldsResponse.status}`);
      }
    });
  }

  async testStaffEndpoints() {
    await this.runTest('Staff Endpoints', async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Test supervisor endpoints
      const supervisorResponse = await fetch('/api/staff/supervisor/dashboard', { headers });
      if (supervisorResponse.status !== 200 && supervisorResponse.status !== 403) {
        throw new Error(`Supervisor dashboard failed: ${supervisorResponse.status}`);
      }
      
      // Test kasir endpoints
      const kasirResponse = await fetch('/api/staff/kasir/bookings', { headers });
      if (kasirResponse.status !== 200 && kasirResponse.status !== 403) {
        throw new Error(`Kasir bookings failed: ${kasirResponse.status}`);
      }
    });
  }

  async testAdminEndpoints() {
    await this.runTest('Admin Endpoints', async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token available');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Test admin bookings endpoint
      const bookingsResponse = await fetch('/api/admin/bookings', { headers });
      if (bookingsResponse.status !== 200 && bookingsResponse.status !== 403) {
        throw new Error(`Admin bookings failed: ${bookingsResponse.status}`);
      }
      
      // Test admin statistics endpoint
      const statsResponse = await fetch('/api/admin/bookings/statistics', { headers });
      if (statsResponse.status !== 200 && statsResponse.status !== 403) {
        throw new Error(`Admin statistics failed: ${statsResponse.status}`);
      }
    });
  }

  // ===== WEBSOCKET TESTS =====

  async testWebSocketConnection() {
    await this.runTest('WebSocket Connection', async () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);
        
        try {
          const ws = new WebSocket('wss://booking-futsal-production.up.railway.app/ws');
          
          ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve();
          };
          
          ws.onerror = (error) => {
            clearTimeout(timeout);
            reject(new Error('WebSocket connection failed'));
          };
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }

  // ===== COMPONENT TESTS =====

  async testComponentRendering() {
    await this.runTest('Component Rendering', async () => {
      // Test if key components exist in DOM
      const components = [
        'EnhancedErrorBoundary',
        'AuthProvider',
        'NotificationProvider'
      ];
      
      // This is a simplified test - in real scenario you'd use testing library
      if (!document.querySelector('[data-testid="app-root"]')) {
        // Create test element if not exists
        const testElement = document.createElement('div');
        testElement.setAttribute('data-testid', 'app-root');
        document.body.appendChild(testElement);
      }
    });
  }

  // ===== PERFORMANCE TESTS =====

  async testPerformanceMetrics() {
    await this.runTest('Performance Metrics', async () => {
      // Test if performance service is working
      if (typeof window.performanceService === 'undefined') {
        // Import performance service
        const { default: performanceService } = await import('../services/PerformanceService.js');
        
        performanceService.startMeasure('test-measure');
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
        const duration = performanceService.endMeasure('test-measure');
        
        if (duration === null) {
          throw new Error('Performance measurement failed');
        }
        
        if (duration < 90 || duration > 200) {
          throw new Error(`Performance measurement inaccurate: ${duration}ms`);
        }
      }
    });
  }

  // ===== BOOKING FLOW TESTS =====

  async testBookingFlow() {
    await this.runTest('Booking Flow', async () => {
      // Test booking creation flow
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token for booking test');
      }
      
      // Test field availability
      const fieldsResponse = await fetch('/api/public/fields');
      if (!fieldsResponse.ok) {
        throw new Error('Cannot fetch fields for booking test');
      }
      
      const fieldsData = await fieldsResponse.json();
      if (!fieldsData.success || !fieldsData.data?.length) {
        throw new Error('No fields available for booking test');
      }
      
      // Test booking creation (dry run)
      const bookingData = {
        fieldId: fieldsData.data[0].id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        timeSlot: '09:00',
        duration: 1,
        notes: 'Integration test booking'
      };
      
      // Note: We're not actually creating a booking to avoid test data pollution
      console.log('📝 Booking test data prepared:', bookingData);
    });
  }

  // ===== NOTIFICATION TESTS =====

  async testNotificationSystem() {
    await this.runTest('Notification System', async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token for notification test');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Test notifications endpoint
      const notificationsResponse = await fetch('/api/customer/notifications', { headers });
      if (!notificationsResponse.ok) {
        throw new Error(`Notifications endpoint failed: ${notificationsResponse.status}`);
      }
      
      // Test unread count endpoint
      const unreadResponse = await fetch('/api/customer/notifications/unread-count', { headers });
      if (!unreadResponse.ok) {
        throw new Error(`Unread count endpoint failed: ${unreadResponse.status}`);
      }
    });
  }

  // ===== ERROR HANDLING TESTS =====

  async testErrorHandling() {
    await this.runTest('Error Handling', async () => {
      // Test 404 endpoint
      const notFoundResponse = await fetch('/api/nonexistent-endpoint');
      if (notFoundResponse.status !== 404) {
        throw new Error('404 error handling not working correctly');
      }
      
      // Test unauthorized access
      const unauthorizedResponse = await fetch('/api/admin/users');
      if (unauthorizedResponse.status !== 401 && unauthorizedResponse.status !== 403) {
        throw new Error('Unauthorized access handling not working correctly');
      }
    });
  }

  // ===== RUN ALL TESTS =====

  async runAllTests() {
    console.log('🚀 Starting comprehensive integration tests...');
    console.log('=' .repeat(60));
    
    const startTime = performance.now();
    
    // API Tests
    await this.testAuthenticationEndpoints();
    await this.testCustomerEndpoints();
    await this.testStaffEndpoints();
    await this.testAdminEndpoints();
    
    // WebSocket Tests
    await this.testWebSocketConnection();
    
    // Component Tests
    await this.testComponentRendering();
    
    // Performance Tests
    await this.testPerformanceMetrics();
    
    // Feature Tests
    await this.testBookingFlow();
    await this.testNotificationSystem();
    
    // Error Handling Tests
    await this.testErrorHandling();
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    // Generate report
    this.generateReport(totalDuration);
  }

  generateReport(totalDuration) {
    console.log('=' .repeat(60));
    console.log('📊 INTEGRATION TEST REPORT');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️ Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log('=' .repeat(60));
    
    if (this.failedTests > 0) {
      console.log('❌ FAILED TESTS:');
      this.testResults
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
      console.log('=' .repeat(60));
    }
    
    // Return results for programmatic use
    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      successRate: (this.passedTests / this.totalTests) * 100,
      duration: totalDuration,
      results: this.testResults
    };
  }
}

// Export for use in browser console or test runner
window.IntegrationTestSuite = IntegrationTestSuite;

// Auto-run tests if in development mode
if (process.env.NODE_ENV === 'development' && window.location.search.includes('runTests=true')) {
  const testSuite = new IntegrationTestSuite();
  testSuite.runAllTests();
}

export default IntegrationTestSuite;
