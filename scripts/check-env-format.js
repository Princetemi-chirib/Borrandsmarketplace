require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment File Format Check');
console.log('=================================\n');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('📋 Raw MONGODB_URI value:');
console.log(`   Length: ${MONGODB_URI ? MONGODB_URI.length : 'undefined'} characters`);
console.log(`   Starts with: ${MONGODB_URI ? MONGODB_URI.substring(0, 20) : 'undefined'}...`);
console.log(`   Contains "MONGODB_URI=": ${MONGODB_URI ? MONGODB_URI.includes('MONGODB_URI=') : 'undefined'}`);

if (MONGODB_URI) {
  console.log('\n🔍 URI Analysis:');
  
  if (MONGODB_URI.startsWith('MONGODB_URI=')) {
    console.log('❌ PROBLEM: URI includes the variable name!');
    console.log('💡 Your .env.local file should have:');
    console.log('   MONGODB_URI=mongodb+srv://...');
    console.log('   NOT: MONGODB_URI=MONGODB_URI=mongodb+srv://...');
  } else if (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://')) {
    console.log('✅ URI format looks correct');
  } else {
    console.log('❌ URI does not start with mongodb:// or mongodb+srv://');
    console.log(`   Actual start: ${MONGODB_URI.substring(0, 30)}...`);
  }
  
  // Check for common issues
  const issues = [];
  if (MONGODB_URI.includes(' ')) issues.push('contains spaces');
  if (MONGODB_URI.includes('\n')) issues.push('contains newlines');
  if (MONGODB_URI.includes('\r')) issues.push('contains carriage returns');
  if (MONGODB_URI.includes('"')) issues.push('contains quotes');
  if (MONGODB_URI.includes("'")) issues.push('contains single quotes');
  
  if (issues.length > 0) {
    console.log(`\n⚠️  Potential issues: ${issues.join(', ')}`);
  } else {
    console.log('\n✅ No obvious formatting issues detected');
  }
  
  // Show masked version for verification
  const masked = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`\n📋 Masked URI: ${masked}`);
  
} else {
  console.log('❌ MONGODB_URI is not set or is empty');
}

console.log('\n💡 If you see issues, check your .env.local file format:');
console.log('   ✅ Correct: MONGODB_URI=mongodb+srv://user:pass@host/db');
console.log('   ❌ Wrong:   MONGODB_URI=MONGODB_URI=mongodb+srv://...');
console.log('   ❌ Wrong:   MONGODB_URI="mongodb+srv://..."');
console.log('   ❌ Wrong:   MONGODB_URI = mongodb+srv://...');
