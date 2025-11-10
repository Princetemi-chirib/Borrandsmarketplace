# Check User Host Configuration

## 🔍 The Issue

The authentication might be failing because the MySQL user `borrands_Temi` is only configured to connect from `localhost`, but you're connecting remotely.

## ✅ How to Fix in cPanel

### **Option 1: Via phpMyAdmin (Recommended)**

1. Go to **cPanel → phpMyAdmin**
2. Click on **Users accounts** tab (or **Users** in some versions)
3. Look for `borrands_Temi`
4. Check the **Host name** column - what does it say?
   - If it says `localhost` - that's the problem!
   - It needs to say `%` (wildcard - means "from anywhere")

### **Option 2: Recreate User with Correct Host**

Since cPanel doesn't always let you change the host, you might need to:

1. **Delete the current user:**
   - MySQL® Databases → Current Users
   - Delete `borrands_Temi`

2. **Create user via phpMyAdmin:**
   - Go to phpMyAdmin
   - Click **"User accounts"** tab
   - Click **"Add user account"**
   - Fill in:
     ```
     User name: borrands_Temi
     Host name: % (select "Any host" from dropdown)
     Password: Amanillah@12
     ```
   - Check **"Grant all privileges on wildcard name"** and type `borrands\_Orderup`
   - Click **"Go"**

3. **Or use SQL command:**
   In phpMyAdmin SQL tab:
   ```sql
   CREATE USER 'borrands_Temi'@'%' IDENTIFIED BY 'Amanillah@12';
   GRANT ALL PRIVILEGES ON borrands_Orderup.* TO 'borrands_Temi'@'%';
   FLUSH PRIVILEGES;
   ```

## 📋 Quick Check

**In phpMyAdmin:**
1. Go to **User accounts** tab
2. Find all users named `borrands_Temi`
3. Tell me what the **Host name** column shows

It might show:
- `localhost` ← This won't work for remote connections
- `%` ← This will work ✅
- Your IP address ← This will only work from that specific IP

---

**What does the Host name column show for borrands_Temi?**

