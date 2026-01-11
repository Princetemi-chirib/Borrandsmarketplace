#!/bin/bash

# Local Database Setup Script
# This script sets up the local MySQL database for development

echo "🔧 Setting up local MySQL database for Borrands Marketplace..."
echo ""

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL service is not running. Please start it with: sudo systemctl start mysql"
    exit 1
fi

echo "✅ MySQL service is running"
echo ""
echo "Please enter your MySQL root password when prompted:"
echo ""

# Try to connect and set up database
mysql -u root -p << 'SQL'
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS borrands_webapp;

-- Create user if it doesn't exist (using mysql_native_password for compatibility)
CREATE USER IF NOT EXISTS 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
CREATE USER IF NOT EXISTS 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';

-- Grant privileges
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';
FLUSH PRIVILEGES;

-- Show success
SELECT 'Database setup completed successfully!' AS Status;
SQL

echo ""
echo "✅ Database 'borrands_webapp' created/verified"
echo "✅ User 'borrands_user' created"
echo "✅ Privileges granted"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Run database migrations: npm run migrate"
    echo "2. (Optional) Seed the database with test data"
    echo "3. Start the dev server: npm run dev"
else
    echo ""
    echo "❌ Database setup failed. Please check your MySQL root password."
    echo ""
    echo "Alternative: You can run the SQL commands manually:"
    echo "  mysql -u root -p"
    echo "  Then paste the SQL commands from this script"
fi
