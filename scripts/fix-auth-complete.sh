#!/bin/bash

# Complete MySQL Authentication Fix Script
# This script will drop and recreate the user with mysql_native_password

echo "🔧 Complete MySQL Authentication Fix"
echo "======================================"
echo ""
echo "This script will:"
echo "1. Drop the existing borrands_user"
echo "2. Recreate it with mysql_native_password"
echo "3. Grant all privileges"
echo ""
echo "You'll need to enter your MySQL root password."
echo "If you don't know it, you can skip password (press Enter) or use sudo."
echo ""

# Function to fix with password
fix_with_password() {
    mysql -u root -p << 'SQL'
DROP USER IF EXISTS 'borrands_user'@'localhost';
DROP USER IF EXISTS 'borrands_user'@'127.0.0.1';

CREATE USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
CREATE USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';

GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';
FLUSH PRIVILEGES;

SELECT User, Host, plugin FROM mysql.user WHERE User = 'borrands_user';
SELECT '✅ User recreated with mysql_native_password!' AS Status;
SQL
}

# Function to fix with sudo
fix_with_sudo() {
    sudo mysql << 'SQL'
DROP USER IF EXISTS 'borrands_user'@'localhost';
DROP USER IF EXISTS 'borrands_user'@'127.0.0.1';

CREATE USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
CREATE USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';

GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';
FLUSH PRIVILEGES;

SELECT User, Host, plugin FROM mysql.user WHERE User = 'borrands_user';
SELECT '✅ User recreated with mysql_native_password!' AS Status;
SQL
}

echo "Choose an option:"
echo "1. Use MySQL root password (recommended)"
echo "2. Use sudo (if you have sudo access)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "Enter MySQL root password:"
        fix_with_password
        ;;
    2)
        echo ""
        echo "Using sudo (you'll need your system password):"
        fix_with_sudo
        ;;
    *)
        echo "Invalid choice. Trying with root password..."
        fix_with_password
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Authentication fixed!"
    echo ""
    echo "Testing connection..."
    mysql -u borrands_user -p'borrands@12' -e "USE borrands_webapp; SELECT 'Connection successful!' AS Status;" 2>&1 | grep -v "Warning"
    echo ""
    echo "You can now run: npm run migrate"
else
    echo ""
    echo "❌ Fix failed. Try running the SQL commands manually."
    echo ""
    echo "Connect to MySQL:"
    echo "  mysql -u root -p"
    echo ""
    echo "Then run:"
    echo "  DROP USER IF EXISTS 'borrands_user'@'localhost';"
    echo "  DROP USER IF EXISTS 'borrands_user'@'127.0.0.1';"
    echo "  CREATE USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';"
    echo "  CREATE USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';"
    echo "  GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';"
    echo "  GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';"
    echo "  FLUSH PRIVILEGES;"
fi
