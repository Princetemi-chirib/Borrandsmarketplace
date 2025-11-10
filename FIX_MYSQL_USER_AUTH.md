# Fix MySQL Authentication Plugin Issue

## 🔴 The Error:
```
Unknown authentication plugin 'sha256_password'
```

## ✅ Solution: Change MySQL User Authentication Method

### **Option 1: Change User Authentication in cPanel** ⭐ **RECOMMENDED**

#### **Step 1: Delete the Current Database User**
1. Go to **cPanel → MySQL® Databases**
2. Scroll to **"Current Users"**
3. Find `borrands_user`
4. Click **"Delete"** next to it
5. Confirm deletion

#### **Step 2: Create New User with Correct Authentication**
1. Still in **MySQL® Databases**
2. Go to **"Add New User"** section
3. Fill in:
   - Username: `borrands_user`
   - Password: `borrands@12`
   - Password (Again): `borrands@12`
4. Click **"Create User"**

#### **Step 3: Grant Privileges**
1. Scroll to **"Add User To Database"**
2. Select:
   - User: `borrands_user`
   - Database: `borrands_webapp`
3. Click **"Add"**
4. Check **"ALL PRIVILEGES"**
5. Click **"Make Changes"**

---

### **Option 2: Fix Via phpMyAdmin SQL** ⭐ **FASTER**

1. Go to **cPanel → phpMyAdmin**
2. Click **"SQL"** tab at the top
3. Run this command:

```sql
ALTER USER 'borrands_user'@'%' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
FLUSH PRIVILEGES;
```

**If that fails, try:**

```sql
ALTER USER 'borrands_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
FLUSH PRIVILEGES;
```

**Or create new user:**

```sql
CREATE USER 'borrands_user'@'%' IDENTIFIED WITH mysql_native_password BY 'borrands@12';
GRANT ALL PRIVILEGES ON borrands_webapp.* TO 'borrands_user'@'%';
FLUSH PRIVILEGES;
```

---

### **Option 3: Use Different Database (Easiest)** ⭐ **QUICKEST**

If the above is too complex, use a free cloud database:

#### **PlanetScale (Free):**
1. Go to https://planetscale.com
2. Sign up
3. Create database
4. Copy connection string
5. Replace in `.env.local`

**Benefits:**
- ✅ Works immediately
- ✅ No authentication issues
- ✅ Better for development
- ✅ Free forever

---

## 🎯 What to Do Now:

**Choose one:**

1. ✅ **Run the SQL command in phpMyAdmin** (Option 2 - fastest)
2. ✅ **Delete and recreate user in cPanel** (Option 1 - safest)
3. ✅ **Use PlanetScale** (Option 3 - easiest)

Let me know which option you'd like, and I'll guide you through it!

