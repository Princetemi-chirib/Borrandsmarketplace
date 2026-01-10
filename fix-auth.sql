-- Fix MySQL Authentication Plugin
-- Run this file with: mysql -u root -p < fix-auth.sql
-- Or copy and paste these commands into MySQL

-- Drop existing users
DROP USER IF EXISTS 'borrands_user'@'localhost';
DROP USER IF EXISTS 'borrands_user'@'127.0.0.1';

-- Recreate users with mysql_native_password
CREATE USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
CREATE USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';

-- Grant privileges
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';
FLUSH PRIVILEGES;

-- Verify
SELECT User, Host, plugin FROM mysql.user WHERE User = 'borrands_user';
