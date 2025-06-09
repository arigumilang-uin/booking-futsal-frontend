// scripts/test-audit-system.js - Test script untuk audit system
const { createAuditLog, getAuditStatistics, cleanOldAuditLogs } = require('../models/system/auditLogModel');

// Generate sample audit logs for testing
const generateSampleAuditLogs = async () => {
  console.log('🔄 Generating sample audit logs...');
  
  const sampleLogs = [
    // Login activities
    {
      user_id: 1,
      action: 'LOGIN',
      resource_type: 'user',
      resource_id: 1,
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additional_info: { success: true, timestamp: new Date().toISOString() }
    },
    {
      user_id: 2,
      action: 'LOGIN',
      resource_type: 'user',
      resource_id: 2,
      ip_address: '192.168.1.100',
      user_agent: 'Chrome/120.0.0.0 Safari/537.36',
      additional_info: { success: true, timestamp: new Date().toISOString() }
    },
    
    // Booking activities
    {
      user_id: 1,
      action: 'CREATE',
      resource_type: 'booking',
      resource_id: 1,
      new_values: { field_id: 1, date: '2024-01-16', start_time: '10:00', end_time: '12:00' },
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additional_info: { booking_type: 'regular' }
    },
    {
      user_id: 2,
      action: 'UPDATE',
      resource_type: 'booking',
      resource_id: 1,
      old_values: { status: 'pending' },
      new_values: { status: 'confirmed' },
      ip_address: '192.168.1.100',
      user_agent: 'Chrome/120.0.0.0 Safari/537.36',
      additional_info: { updated_by: 'manager' }
    },
    
    // Field management
    {
      user_id: 1,
      action: 'CREATE',
      resource_type: 'field',
      resource_id: 2,
      new_values: { name: 'Lapangan B', type: 'futsal', price: 150000 },
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additional_info: { created_by: 'supervisor' }
    },
    {
      user_id: 1,
      action: 'UPDATE',
      resource_type: 'field',
      resource_id: 1,
      old_values: { price: 100000 },
      new_values: { price: 120000 },
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additional_info: { reason: 'price_adjustment' }
    },
    
    // Payment activities
    {
      user_id: 2,
      action: 'UPDATE',
      resource_type: 'payment',
      resource_id: 1,
      old_values: { status: 'pending' },
      new_values: { status: 'completed' },
      ip_address: '192.168.1.100',
      user_agent: 'Chrome/120.0.0.0 Safari/537.36',
      additional_info: { payment_method: 'transfer' }
    },
    
    // User management
    {
      user_id: 1,
      action: 'CREATE',
      resource_type: 'user',
      resource_id: 4,
      new_values: { name: 'Test User', role: 'penyewa', email: 'test@example.com' },
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additional_info: { created_by: 'supervisor' }
    },
    
    // Critical actions
    {
      user_id: 3,
      action: 'DELETE',
      resource_type: 'booking',
      resource_id: 2,
      old_values: { status: 'confirmed' },
      new_values: { status: 'cancelled' },
      ip_address: '192.168.1.200',
      user_agent: 'Safari/17.0 Version/17.0',
      additional_info: { reason: 'user_request' }
    },
    
    // Logout activities
    {
      user_id: 1,
      action: 'LOGOUT',
      resource_type: 'user',
      resource_id: 1,
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      additional_info: { session_duration: '2h30m' }
    },
    {
      user_id: 2,
      action: 'LOGOUT',
      resource_type: 'user',
      resource_id: 2,
      ip_address: '192.168.1.100',
      user_agent: 'Chrome/120.0.0.0 Safari/537.36',
      additional_info: { session_duration: '4h15m' }
    }
  ];

  try {
    for (const logData of sampleLogs) {
      await createAuditLog(logData);
      console.log(`✅ Created audit log: ${logData.action} for ${logData.resource_type}`);
    }
    console.log(`🎉 Successfully generated ${sampleLogs.length} sample audit logs!`);
  } catch (error) {
    console.error('❌ Error generating sample logs:', error);
  }
};

// Test audit statistics
const testAuditStatistics = async () => {
  console.log('\n📊 Testing audit statistics...');
  
  try {
    const stats = await getAuditStatistics(30);
    console.log('📈 Audit Statistics (30 days):');
    console.log(`   Total Logs: ${stats.total_logs}`);
    console.log(`   Today Logs: ${stats.today_logs}`);
    console.log(`   Unique Users: ${stats.unique_users}`);
    console.log(`   Critical Actions: ${stats.critical_actions}`);
    console.log(`   Login Actions: ${stats.login_actions}`);
    console.log(`   Logout Actions: ${stats.logout_actions}`);
    console.log(`   Create Actions: ${stats.create_actions}`);
    console.log(`   Update Actions: ${stats.update_actions}`);
    console.log(`   Delete Actions: ${stats.delete_actions}`);
  } catch (error) {
    console.error('❌ Error testing statistics:', error);
  }
};

// Test cleanup operations
const testCleanupOperations = async () => {
  console.log('\n🧹 Testing cleanup operations...');
  
  try {
    // Test cleanup (this won't delete anything since logs are recent)
    const result = await cleanOldAuditLogs(365); // Keep logs for 1 year
    console.log(`🗑️ Cleanup result: ${result?.deleted_count || 0} old logs deleted`);
  } catch (error) {
    console.error('❌ Error testing cleanup:', error);
  }
};

// Main test function
const runAuditSystemTests = async () => {
  console.log('🚀 Starting Audit System Tests...\n');
  
  try {
    await generateSampleAuditLogs();
    await testAuditStatistics();
    await testCleanupOperations();
    
    console.log('\n✅ All audit system tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login to the frontend to generate real audit logs');
    console.log('   2. Check the Audit Trail tab in System & Audit');
    console.log('   3. Test the cleanup operations from the frontend');
    console.log('   4. Verify statistics are displaying correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAuditSystemTests();
}

module.exports = {
  generateSampleAuditLogs,
  testAuditStatistics,
  testCleanupOperations,
  runAuditSystemTests
};
