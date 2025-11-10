# How to Get Your cPanel Database Credentials

## 🔍 Step-by-Step Guide

### **Step 1: Go to MySQL® Databases in cPanel**

1. Login to your cPanel
2. Find and click on **"MySQL® Databases"** (usually in the Databases section)

---

### **Step 2: Find Your Database Name**

Scroll down to the section called **"Current Databases"**

You should see something like:

```
Current Databases
┌─────────────────────────────────┬────────┬───────────┐
│ Database                        │ Size   │ Actions   │
├─────────────────────────────────┼────────┼───────────┤
│ cpaneluser_borrands_webapp      │ 25 MB  │ [Delete]  │
└─────────────────────────────────┴────────┴───────────┘
```

**Copy the full database name** (including the prefix)

---

### **Step 3: Find Your Database User**

Scroll down to **"Current Users"**

You should see:

```
Current Users
┌─────────────────────────────────┬────────────┐
│ User                            │ Actions    │
├─────────────────────────────────┼────────────┤
│ cpaneluser_borrands_user        │ [Delete]   │
└─────────────────────────────────┴────────────┘
```

**Copy the username** (including the prefix)

---

### **Step 4: Find Your Database Host**

The database host is usually one of these:

**Option A:** Same as your website URL
- If your site is `example.com`, try `mysql.example.com` or just `localhost`

**Option B:** Check your hosting email
- When you signed up, your host sent you an email with database server details

**Option C:** Check phpMyAdmin
1. Go to cPanel → phpMyAdmin
2. Look at the top of the page
3. You'll see: **Server: mysql.yourhost.com** or an IP address

**Option D:** Common formats by host:
- **cPanel on same server:** `localhost`
- **Hostinger:** `mysql.hostinger.com` or `localhost`
- **Bluehost:** `localhost` or `box####.bluehost.com`
- **SiteGround:** `localhost` or `mysql.siteground.com`
- **GoDaddy:** `localhost` or IP address
- **Namecheap:** `localhost` or `server###.web-hosting.com`

---

### **Step 5: Database Password**

This is the password you set when creating the database user.

**If you forgot it:**
1. Go to MySQL® Databases in cPanel
2. Scroll to "Current Users"
3. Click **"Change Password"** next to your user
4. Set a new password

---

## 📋 What to Tell Me

Please provide:

```
1. Database Name: cpaneluser_________
2. Database Username: cpaneluser_________
3. Database Password: _________ (the one you set)
4. Database Host: _________ (try localhost first, or check phpMyAdmin)
5. Port: 3306 (default, unless your host told you otherwise)
```

---

## 🎯 Quick Test

**If you're not sure about the host, try these in order:**

1. `localhost` (most common for cPanel)
2. Your server's main domain
3. Check the "Server" shown in phpMyAdmin
4. Contact your hosting support

---

## 📞 Can't Find It?

If you can't find these details:
1. Check your hosting welcome email
2. Contact your hosting provider support
3. They can provide the exact MySQL host address

---

Once you provide these details, I'll update your `.env.local` immediately!

