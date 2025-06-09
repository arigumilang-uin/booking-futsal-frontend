#!/usr/bin/env node

/**
 * Production Deployment Helper
 * Prepares for GitHub push and Vercel auto-deployment
 */

import { spawn } from 'child_process';

function prepareDeployment() {
  console.log('🚀 Preparing for Production Deployment...');
  console.log('');

  console.log('📦 Building for production to verify...');

  // Build for production to verify
  const buildProcess = spawn('npm', ['run', 'build:prod'], {
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Build verification completed successfully!');
      console.log('');

      console.log('🔧 Changes Applied:');
      console.log('   ✅ Fixed API base URL for production');
      console.log('   ✅ Added proper CORS headers');
      console.log('   ✅ Increased timeout for production');
      console.log('   ✅ Added Origin header for Vercel');
      console.log('');

      console.log('📋 Deployment Steps:');
      console.log('   1. git add .');
      console.log('   2. git commit -m "Fix production API configuration"');
      console.log('   3. git push origin main');
      console.log('   4. Vercel will auto-deploy from GitHub');
      console.log('   5. Wait 2-3 minutes for deployment');
      console.log('');

      console.log('🌐 Production URLs:');
      console.log('   Frontend: https://booking-futsal-frontend.vercel.app');
      console.log('   Backend:  https://booking-futsal-production.up.railway.app');
      console.log('   API:      https://booking-futsal-production.up.railway.app/api');
      console.log('');

      console.log('🧪 Test After Deployment:');
      console.log('   Login URL: https://booking-futsal-frontend.vercel.app/login');
      console.log('   Manager: ppwweebb02@gmail.com / futsaluas');
      console.log('   Customer: ppwweebb05@gmail.com / futsaluas');
      console.log('');

      console.log('🔍 Verify Deployment:');
      console.log('   npm run test:api  # Test production API');
      console.log('');

      console.log('✅ Ready for GitHub push and Vercel auto-deployment!');
    } else {
      console.error('❌ Build verification failed with code:', code);
      console.error('Please fix build errors before deploying');
      process.exit(1);
    }
  });

  buildProcess.on('error', (error) => {
    console.error('❌ Build error:', error);
    process.exit(1);
  });
}

// Run deployment preparation
prepareDeployment();
