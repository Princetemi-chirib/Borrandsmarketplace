# cPanel Database Configuration Guide

## 🔧 How to Get Your Database Credentials from cPanel

### **Step 1: Login to cPanel**
Go to your hosting cPanel dashboard

### **Step 2: Find MySQL Database Settings**
Look for "MySQL® Databases" or "Remote MySQL" in cPanel

### **Step 3: Get These Details:**

You need to provide me with:

1. **Database Host/Server**: 
   - Usually looks like: `yourserver.mysql.database.azure.com`
   - Or: `mysql.yourhosting.com`
   - Or: `localhost` (if web server and DB are on same server)
   - Or: An IP address like `123.45.67.89`

2. **Database Name**: 
   - Example: `username_borrands_webapp`
   - cPanel databases usually have prefix like `cpanelusername_dbname`

3. **Database Username**: 
   - Example: `username_borrands_user`
   - Usually has the same prefix as database name

4. **Database Password**: 
   - The password you set when creating the database user

5. **Port**: 
   - Usually `3306` (default MySQL port)
   - Some hosts use different ports like `3307`

---

## 📋 Example Configuration

**If your details are:**
- Host: `mysql.yourhosting.com`
- Port: `3306`
- Database: `cpanel_borrands`
- Username: `cpanel_user`
- Password: `SecurePass123!`

**Your DATABASE_URL will be:**
```
DATABASE_URL="mysql://cpanel_user:SecurePass123!@mysql.yourhosting.com:3306/cpanel_borrands"
```

---

## ⚠️ Important Notes

### **Special Characters in Password**
If your password contains special characters, they need to be URL-encoded:

| Character | Encoded |
|-----------|---------|
| @         | %40     |
| #         | %23     |
| $         | %24     |
| %         | %25     |
| ^         | %5E     |
| &         | %26     |
| *         | %2A     |
| !         | %21     |
| (         | %28     |
| )         | %29     |

**Example:** 
- Password: `Pass@123!`
- Encoded: `Pass%40123%21`

---

## 🌐 Enable Remote MySQL Access (IMPORTANT!)

### In cPanel:

1. **Go to "Remote MySQL®"**
2. **Add Access Host:**
   - Add your local IP address (find it at https://whatismyipaddress.com)
   - Or add `%` for allow all (less secure, but works)
   - Or add your Vercel deployment IP ranges

3. **Save changes**

Without this step, your local development won't connect to the database!

---

## 🔍 How to Find Your Connection Details

### **Method 1: cPanel MySQL Databases**
1. Go to cPanel → MySQL® Databases
2. Scroll down to see:
   - Current Databases (your database name)
   - Current Users (your username)

### **Method 2: phpMyAdmin**
1. Go to cPanel → phpMyAdmin
2. Look at the top for server information
3. Check the connection parameters

### **Method 3: Ask Your Host**
Contact your hosting provider support and ask for:
- MySQL host address
- MySQL port
- Database connection details

---

## 📝 What to Provide Me

Please provide these 5 details:

```
1. Database Host: ___________________
2. Database Port: ___________________
3. Database Name: ___________________
4. Database Username: _______________
5. Database Password: _______________
```

Once you provide these, I'll update your `.env.local` file immediately!

---

## 🚀 After Configuration

Once I update the `.env.local`, we'll run:

```bash
# Test connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Your signup and login will work perfectly after this! ✅

