# Fix: Unknown authentication plugin `sha256_password`

## The Problem

You're getting this error:
```
Error: Schema engine error:
Error querying the database: Unknown authentication plugin `sha256_password'.
```

This happens because MySQL 8.0+ uses `sha256_password` by default, but Prisma requires `mysql_native_password`.

## Quick Fix

Run this script (you'll need your MySQL root password):
```bash
./scripts/fix-mysql-auth.sh
```

## Manual Fix

If the script doesn't work, run these commands manually:

1. Connect to MySQL as root:
```bash
mysql -u root -p
```

2. Run these SQL commands:
```sql
ALTER USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
ALTER USER 'borrands_user'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
FLUSH PRIVILEGES;
EXIT;
```

3. Verify the change:
```sql
SELECT User, Host, plugin FROM mysql.user WHERE User = 'borrands_user';
```

You should see `mysql_native_password` in the plugin column.

## After Fixing

Once the authentication plugin is fixed, run:
```bash
npm run migrate
```

This should now work without the authentication error.

## Why This Happens

- MySQL 8.0+ defaults to `sha256_password` for new users
- Prisma/MySQL2 drivers don't fully support `sha256_password`
- `mysql_native_password` is the older, more compatible authentication method
- The fix changes the user to use the compatible authentication method
