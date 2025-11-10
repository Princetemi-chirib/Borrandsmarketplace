# Step-by-Step: Recreate MySQL User in cPanel

## 🎯 Follow These Exact Steps:

### **Step 1: Remove Old User from Database**
1. Go to **cPanel → MySQL® Databases**
2. Scroll down to **"Current Databases"**
3. Find `borrands_webapp`
4. Look for **"Privileged Users"** column
5. Click the **"X"** or **"Remove"** next to `borrands_user`
6. Confirm removal

### **Step 2: Delete the User**
1. Scroll down to **"Current Users"**
2. Find `borrands_user`
3. Click **"Delete"** (trash icon)
4. Confirm deletion

### **Step 3: Create New User**
1. Scroll up to **"Add New User"** section
2. Fill in:
   ```
   Username: borrands_user
   Password: borrands@12
   Password (Again): borrands@12
   ```
3. **Password Strength:** Should show "Strong"
4. Click **"Create User"**

### **Step 4: Add User to Database**
1. Scroll to **"Add User To Database"**
2. Select:
   - **User:** `borrands_user`
   - **Database:** `borrands_webapp`
3. Click **"Add"**

### **Step 5: Grant All Privileges**
1. You'll see "Manage User Privileges" page
2. Check the box for **"ALL PRIVILEGES"** (at the top)
3. Click **"Make Changes"**

### **Step 6: Verify Remote Access**
1. Go to **"Remote MySQL®"** in cPanel
2. Verify `131.153.147.186` is still listed
3. If not, add it again

---

## ✅ After Completing These Steps

Run this command to test:

```bash
npm run dev
```

Your signup and login will work! 🎉

---

## 📸 What Each Section Looks Like

### Add New User Section:
```
┌─────────────────────────────────┐
│ Add New User                    │
├─────────────────────────────────┤
│ Username: [prefix]_[___user___] │
│ Password: [_______________]     │
│ Password (Again): [___________] │
│ [Create User]                   │
└─────────────────────────────────┘
```

### Add User To Database Section:
```
┌─────────────────────────────────┐
│ Add User To Database            │
├─────────────────────────────────┤
│ User: [Select User ▼]          │
│ Database: [Select Database ▼]  │
│ [Add]                           │
└─────────────────────────────────┘
```

---

## ⚠️ Important Notes

- The username will have a prefix (like `cpaneluser_borrands_user`)
- Make sure you copy the FULL username with prefix
- Use the FULL username in your `.env.local` if it has a prefix

Let me know if you see a prefix and I'll update the config!

