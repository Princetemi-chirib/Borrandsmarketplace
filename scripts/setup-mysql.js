const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect with root user first (no password)
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: ''
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS borrands_webapp');
    console.log('✅ Database borrands_webapp created');
    
    // Create user
    await connection.execute(`CREATE USER IF NOT EXISTS 'borrands_user'@'127.0.0.1' IDENTIFIED BY 'borrands@12'`);
    await connection.execute(`CREATE USER IF NOT EXISTS 'borrands_user'@'localhost' IDENTIFIED BY 'borrands@12'`);
    console.log('✅ User borrands_user created');
    
    // Grant privileges
    await connection.execute(`GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1'`);
    await connection.execute(`GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost'`);
    console.log('✅ Privileges granted');
    
    // Flush privileges
    await connection.execute('FLUSH PRIVILEGES');
    console.log('✅ Privileges flushed');
    
    await connection.end();
    console.log('✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure MySQL server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check your MySQL root credentials');
    }
  }
}

setupDatabase();
