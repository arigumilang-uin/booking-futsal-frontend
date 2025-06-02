#!/usr/bin/env node
// scripts/dev-setup.js
// Development Environment Setup Script

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Development Environment...\n');

/**
 * Check if command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
  console.log('📋 Checking Prerequisites...');
  
  const requirements = [
    { name: 'Node.js', command: 'node', version: '--version' },
    { name: 'npm', command: 'npm', version: '--version' },
    { name: 'Git', command: 'git', version: '--version' }
  ];

  let allGood = true;

  requirements.forEach(req => {
    if (commandExists(req.command)) {
      try {
        const version = execSync(`${req.command} ${req.version}`, { encoding: 'utf8' }).trim();
        console.log(`✅ ${req.name}: ${version}`);
      } catch (error) {
        console.log(`✅ ${req.name}: Installed`);
      }
    } else {
      console.log(`❌ ${req.name}: Not found`);
      allGood = false;
    }
  });

  return allGood;
}

/**
 * Check environment files
 */
function checkEnvironmentFiles() {
  console.log('\n📁 Checking Environment Files...');
  
  const envFiles = [
    '.env.development',
    '.env.production'
  ];

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.log(`❌ ${file}: Missing`);
    }
  });
}

/**
 * Install dependencies
 */
function installDependencies() {
  console.log('\n📦 Installing Dependencies...');
  
  try {
    console.log('Installing frontend dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Frontend dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Test backend connection
 */
async function testBackendConnection() {
  console.log('\n🔗 Testing Backend Connection...');
  
  const backendUrl = 'http://localhost:3000/api/test/health';
  
  try {
    const response = await fetch(backendUrl);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running');
      console.log(`   Status: ${data.status}`);
      console.log(`   Environment: ${data.environment}`);
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    console.log('💡 Make sure backend is running on port 3000');
    return false;
  }
}

/**
 * Display setup instructions
 */
function displayInstructions() {
  console.log('\n📖 Development Setup Instructions:');
  console.log('');
  console.log('1. 🏗️ Backend Setup:');
  console.log('   cd ../booking_futsal');
  console.log('   npm install');
  console.log('   cp .env.example .env.development');
  console.log('   # Configure DATABASE_URL and JWT_SECRET');
  console.log('   npm run dev');
  console.log('');
  console.log('2. 🎨 Frontend Setup:');
  console.log('   npm run dev');
  console.log('');
  console.log('3. 🧪 Testing:');
  console.log('   Open http://localhost:5173');
  console.log('   Open browser console');
  console.log('   Run: testDevelopmentEnvironment()');
  console.log('');
  console.log('4. 📚 Documentation:');
  console.log('   See docs/DEVELOPMENT_SETUP.md for detailed guide');
}

/**
 * Main setup function
 */
async function main() {
  try {
    // Check prerequisites
    if (!checkPrerequisites()) {
      console.log('\n❌ Prerequisites not met. Please install missing requirements.');
      process.exit(1);
    }

    // Check environment files
    checkEnvironmentFiles();

    // Install dependencies
    if (!installDependencies()) {
      console.log('\n❌ Failed to install dependencies.');
      process.exit(1);
    }

    // Test backend connection
    const backendRunning = await testBackendConnection();

    // Display instructions
    displayInstructions();

    // Final status
    console.log('\n🎯 Development Environment Status:');
    console.log(`Frontend Dependencies: ✅ Installed`);
    console.log(`Backend Connection: ${backendRunning ? '✅ Connected' : '❌ Not Connected'}`);
    
    if (backendRunning) {
      console.log('\n🚀 Ready to start development!');
      console.log('Run: npm run dev');
    } else {
      console.log('\n⚠️ Backend not running. Start backend first:');
      console.log('cd ../booking_futsal && npm run dev');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
main();
