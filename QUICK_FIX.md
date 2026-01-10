# 🔧 QUICK FIX - MySQL Authentication Error

## The Problem
You're getting: `Unknown authentication plugin 'sha256_password'`

## Solution (Choose ONE method)

### Method 1: Run SQL File (Easiest)
```bash
mysql -u root -p < fix-auth.sql
```
Enter your MySQL root password when prompted.

### Method 2: Manual SQL Commands
1. Open terminal and run:
```bash
mysql -u root -p
```

2. Enter your MySQL root password

3. Copy and paste these commands:
```sql
DROP USER IF EXISTS 'borrands_user'@'localhost';
DROP USER IF EXISTS 'borrands_user'@'127.0.0.1';
CREATE USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
CREATE USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'localhost';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

### Method 3: Use Sudo (If you have sudo access)
```bash
sudo mysql < fix-auth.sql
```

## After Fixing

1. **Test the connection:**
```bash
mysql -u borrands_user -p'borrands@12' -e "USE borrands_webapp; SELECT 'Success!' AS Status;"
```

2. **Run migrations:**
```bash
npm run migrate
```

3. **Start the server:**
```bash
npm run dev
```

4. **Access admin login:**
```
http://localhost:3000/auth/login
```

## If You Don't Know MySQL Root Password

Try these:
- Empty password (just press Enter)
- Your system password
- Check if you can use: `sudo mysql` (no password needed)

