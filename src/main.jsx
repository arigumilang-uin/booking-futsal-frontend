import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // <--- wajib untuk styling Tailwind

// Import test utilities untuk development
if (import.meta.env.DEV) {
  import('./utils/testRunner.js').then(() => {
    console.log('🧪 Test Runner loaded! Use runCustomerBookingTests() in console to run tests.');
  });

  import('./utils/developmentTest.js').then(() => {
    console.log('🔧 Development Test loaded! Use testDevelopmentEnvironment() in console to test integration.');
  });

  import('../debug/login-troubleshoot.js').then(() => {
    console.log('🔍 Login Troubleshoot loaded! Use troubleshootLogin() in console to debug login issues.');
  });

  import('../debug/frontend-login-debug.js').then(() => {
    console.log('🎯 Frontend Login Debug loaded! Use debugFrontendLogin() in console to debug frontend issues.');
  });

  import('../debug/immediate-login-test.js').then(() => {
    console.log('⚡ Immediate Login Test loaded! Use immediateLoginTest() or testAllAccounts() in console.');
  });

  import('../debug/frontend-production-integration-test.js').then(() => {
    console.log('🔍 Frontend-Production Integration Test loaded! Use verifyFrontendProductionIntegration() in console.');
  });

  import('../debug/booking-sync-investigation.js').then(() => {
    console.log('🔄 Booking Sync Investigation loaded! Use investigateBookingSynchronization() in console.');
  });

  import('../debug/cookie-auth-test.js').then(() => {
    console.log('🍪 Cookie Auth Test loaded! Use testCookieAuthentication(), testHybridAuthentication(), testBookingSynchronization() in console.');
  });

  import('../debug/staff-dashboard-debug.js').then(() => {
    console.log('👨‍💼 Staff Dashboard Debug loaded! Use debugStaffDashboardVisibility() in console.');
  });

  import('../debug/comprehensive-staff-booking-test.js').then(() => {
    console.log('👥 Comprehensive Staff Test loaded! Use testAllStaffRolesBookingVisibility() in console.');
  });

  import('../debug/staff-booking-workaround.js').then(() => {
    console.log('🔧 Staff Booking Workaround loaded! Use getStaffBookingsWorkaround() or quickStaffBookingTest() in console.');
  });

  import('../debug/backend-frontend-integration-debug.js').then(() => {
    console.log('🔗 Backend-Frontend Integration Debug loaded! Use investigateBookingDataIntegration() in console.');
  });

  import('../debug/final-integration-test.js').then(() => {
    console.log('🎯 Final Integration Test loaded! Use finalBookingIntegrationTest() in console.');
  });

  import('../debug/api-error-detection.js').then(() => {
    console.log('🔍 API Error Detection loaded! Use detectAPIErrors() in console.');
  });

  import('../debug/quick-api-test.js').then(() => {
    console.log('⚡ Quick API Test loaded! Use quickAPITest() or testFrontendAPI() in console.');
  });

  import('../debug/backend-endpoint-test.js').then(() => {
    console.log('🔍 Backend Endpoint Test loaded! Use testBackendBookingEndpoints() in console.');
  });

  import('../debug/customer-endpoint-enhancement-test.js').then(() => {
    console.log('🔧 Customer Endpoint Enhancement Test loaded! Use testCustomerEndpointEnhancement() in console.');
  });

  import('../debug/admin-booking-endpoint-test.js').then(() => {
    console.log('👑 Admin Booking Endpoint Test loaded! Use testAdminBookingEndpoints() in console.');
  });

  import('../debug/backend-endpoint-failure-test.js').then(() => {
    console.log('🔍 Backend Endpoint Failure Test loaded! Use testBackendEndpointFailures() in console.');
  });

  import('../debug/fixed-endpoints-verification-test.js').then(() => {
    console.log('🎉 Fixed Endpoints Verification Test loaded! Use verifyFixedEndpoints() in console.');
  });

  import('../debug/frontend-data-display-debug.js').then(() => {
    console.log('🔍 Frontend Data Display Debug loaded! Use debugFrontendDataDisplay() in console.');
  });

  import('../debug/final-project-test.js').then(() => {
    console.log('🚀 Final Project Test loaded! Use testProjectStatus() in console.');
  });

  import('../debug/production-backend-dev-frontend-test.js').then(() => {
    console.log('🏭 Production Backend + Dev Frontend Test loaded! Use testProductionBackendDevFrontend() in console.');
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
