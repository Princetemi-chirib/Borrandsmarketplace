# Local Database Setup Guide

## Quick Setup

Your `.env.local` has been updated to use localhost. Now you need to set up the local MySQL database.

### Option 1: Automated Setup (Recommended)

Run the setup script:
```bash
./scripts/setup-local-db.sh
```

You'll be prompted for your MySQL root password.

### Option 2: Manual Setup

1. Connect to MySQL as root:
```bash
mysql -u root -p
```

2. Run these SQL commands:
```sql
CREATE DATABASE IF NOT EXISTS borrands_webapp;
CREATE USER IF NOT EXISTS 'borrands_user'@'localhost' IDENTIFIED BY 'borrands@12';
CREATE USER IF NOT EXISTS 'borrands_user'@'127.0.0.1' IDENTIFIED BY 'borrands@12';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

### Option 3: If You Don't Know MySQL Root Password

If you've forgotten your MySQL root password, you can reset it:

1. Stop MySQL:
```bash
sudo systemctl stop mysql
```

2. Start MySQL in safe mode:
```bash
sudo mysqld_safe --skip-grant-tables &
```

3. Connect without password:
```bash
mysql -u root
```

4. Reset password:
```sql
USE mysql;
UPDATE user SET authentication_string=PASSWORD('your_new_password') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

5. Restart MySQL normally:
```bash
sudo systemctl restart mysql
```

## After Database Setup

1. **Run migrations** to create the database schema:
```bash
npm run migrate
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Access the admin login** at:
```
http://localhost:3000/auth/login
```

## Using Production Database (Alternative)

If you need to connect to the production database instead, you have a few options:

### Option A: SSH Tunnel
Create an SSH tunnel to access the remote database:
```bash
ssh -L 3306:localhost:3306 your-username@borrands.com.ng -N
```

Then update `.env.local` to use `localhost` (the tunnel will forward to the remote server).

### Option B: Restore Production Config
If you have VPN access to the production database:
```bash
cp .env.local.production.backup .env.local
```

## Troubleshooting

- **"Access denied"**: Check your MySQL root password
- **"Can't connect to MySQL server"**: Make sure MySQL is running: `sudo systemctl status mysql`
- **"Database doesn't exist"**: Run the setup script or manual SQL commands above
- **"User doesn't have privileges"**: Make sure you ran the GRANT commands
