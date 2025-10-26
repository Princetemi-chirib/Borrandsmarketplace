require('dotenv').config({ path: '.env.local' });

console.log('🔍 Detailed URI Debug');
console.log('=====================\n');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI not found');
  process.exit(1);
}

console.log('📋 Full URI (masked for security):');
const masked = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
console.log(masked);
console.log('');

// Parse the URI to see what's happening
const uriMatch = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/\?]+)/);

if (uriMatch) {
  const [, username, password, host] = uriMatch;
  
  console.log('🔍 Parsed Components:');
  console.log(`   Username: "${username}"`);
  console.log(`   Password: "${password}"`);
  console.log(`   Host: "${host}"`);
  console.log('');
  
  console.log('🔍 Password Analysis:');
  console.log(`   Length: ${password.length} characters`);
  console.log(`   Contains <: ${password.includes('<')}`);
  console.log(`   Contains @: ${password.includes('@')}`);
  console.log(`   Contains >: ${password.includes('>')}`);
  console.log(`   Contains %3C: ${password.includes('%3C')}`);
  console.log(`   Contains %40: ${password.includes('%40')}`);
  console.log(`   Contains %3E: ${password.includes('%3E')}`);
  console.log('');
  
  if (password.includes('<') || password.includes('@') || password.includes('>')) {
    console.log('❌ PROBLEM: Password contains unencoded special characters!');
    console.log('💡 Your password should be URL-encoded:');
    console.log('   <Amanillah@12> should become %3CAmanillah%4012%3E');
  } else if (password.includes('%3C') && password.includes('%40') && password.includes('%3E')) {
    console.log('✅ Password appears to be properly URL-encoded');
  } else {
    console.log('⚠️  Password format unclear - may need URL encoding');
  }
  
  console.log('');
  console.log('🔍 Host Analysis:');
  if (host.includes('12>')) {
    console.log('❌ PROBLEM: Host contains "12>" - this suggests password parsing issue');
    console.log('💡 The ">" character is being interpreted as part of the hostname');
  } else {
    console.log('✅ Host looks correct');
  }
  
} else {
  console.log('❌ Could not parse URI format');
  console.log('URI:', MONGODB_URI);
}

console.log('\n💡 Expected format:');
console.log('   mongodb+srv://rabiutemi_db_user:%3CAmanillah%4012%3E@cluster0.vaoardq.mongodb.net/...');
