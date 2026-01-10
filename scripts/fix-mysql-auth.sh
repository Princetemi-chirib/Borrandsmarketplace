#!/bin/bash

# Fix MySQL Authentication Plugin Issue
# This script changes the user authentication from sha256_password to mysql_native_password

echo "🔧 Fixing MySQL authentication plugin..."
echo ""
echo "This will update the 'borrands_user' to use mysql_native_password instead of sha256_password"
echo "Please enter your MySQL root password when prompted:"
echo ""

mysql -u root -p << 'SQL'
-- Update user authentication plugin to mysql_native_password
ALTER USER IF EXISTS 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
ALTER USER IF EXISTS 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
FLUSH PRIVILEGES;

-- Verify the change
SELECT User, Host, plugin FROM mysql.user WHERE User = 'borrands_user';

SELECT '✅ Authentication plugin updated successfully!' AS Status;
SQL

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Authentication plugin fixed!"
    echo ""
    echo "You can now run: npm run migrate"
else
    echo ""
    echo "❌ Failed to update authentication plugin."
    echo ""
    echo "Alternative: Run these SQL commands manually:"
    echo "  mysql -u root -p"
    echo "  Then paste:"
    echo "    ALTER USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';"
    echo "    ALTER USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';"
    echo "    FLUSH PRIVILEGES;"
fi
