// clean-debug-statements.cjs - Remove debug statements from production code
const fs = require('fs');
const path = require('path');

// Patterns to clean
const DEBUG_PATTERNS = [
  // Console statements to remove completely
  /^\s*console\.(log|debug|info|warn|error|trace|table|group|groupEnd|time|timeEnd)\s*\([^)]*\);\s*$/gm,
  /^\s*console\.(log|debug|info|warn|error|trace|table|group|groupEnd|time|timeEnd)\s*\([^)]*\);\s*\n/gm,
  
  // Debugger statements
  /^\s*debugger\s*;\s*$/gm,
  /^\s*debugger\s*;\s*\n/gm,
  
  // Alert/confirm statements (but keep confirm for user interactions)
  /^\s*alert\s*\([^)]*\);\s*$/gm,
  /^\s*alert\s*\([^)]*\);\s*\n/gm
];

// Files to exclude from cleaning (keep some console.error for production error handling)
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build'
];

// Get all source files
function getAllSourceFiles() {
  const files = [];
  
  function scanDirectory(dir) {
    if (EXCLUDE_PATTERNS.some(pattern => dir.includes(pattern))) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (/\.(jsx?|ts|tsx)$/.test(item)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }
  
  scanDirectory('src');
  files.push('vite.config.js');
  
  return files;
}

// Clean debug statements from file
function cleanDebugStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changesCount = 0;
    
    // Remove debug statements but keep essential error handling
    DEBUG_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        // Filter out essential error handling
        matches.forEach(match => {
          // Keep console.error in catch blocks and error handling
          if (match.includes('console.error') && 
              (content.includes('catch') || content.includes('error') || content.includes('Error'))) {
            // Keep essential error logging, but clean up development-only ones
            if (match.includes('❌') || match.includes('Error:') || match.includes('debug')) {
              content = content.replace(match, '');
              changesCount++;
            }
          } else if (!match.includes('console.error')) {
            // Remove all non-error console statements
            content = content.replace(match, '');
            changesCount++;
          }
        });
      }
    });
    
    // Clean up empty lines left by removed statements
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return changesCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error cleaning ${filePath}:`, error.message);
    return 0;
  }
}

// Main cleaning function
function cleanAllDebugStatements() {
  console.log('🧹 Cleaning debug statements from production code...\n');
  
  const sourceFiles = getAllSourceFiles();
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of sourceFiles) {
    const changes = cleanDebugStatements(file);
    if (changes > 0) {
      console.log(`✅ ${file}: ${changes} debug statements removed`);
      totalChanges += changes;
      filesChanged++;
    }
  }
  
  console.log(`\n📊 CLEANUP SUMMARY:`);
  console.log(`   📁 Files processed: ${sourceFiles.length}`);
  console.log(`   📝 Files changed: ${filesChanged}`);
  console.log(`   🗑️  Debug statements removed: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n✨ Debug statements cleanup completed successfully!');
  } else {
    console.log('\n✅ No debug statements found to clean.');
  }
  
  return { totalChanges, filesChanged };
}

// Run cleanup
if (require.main === module) {
  cleanAllDebugStatements();
}

module.exports = { cleanAllDebugStatements };
