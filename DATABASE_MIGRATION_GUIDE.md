# Database Migration Guide

## 🚀 How to Apply the New Changes

### **What Changed:**
1. Added `DeliveryLocation` model (new table)
2. Added `deliveryPhone` field to `Order` model

---

## 📝 **Step-by-Step Migration**

### **Option 1: Development Environment (Recommended)**

```bash
# 1. Make sure you're in the project directory
cd /path/to/Borrands

# 2. Generate and apply migration
npx prisma migrate dev --name add_delivery_locations_and_phone

# This will:
# - Create the migration file
# - Apply it to your database
# - Generate new Prisma Client
```

---

### **Option 2: Production Environment**

```bash
# 1. Generate migration locally first (on dev)
npx prisma migrate dev --name add_delivery_locations_and_phone

# 2. Commit the migration file
git add prisma/migrations
git commit -m "Add delivery locations and phone field"

# 3. On production server, deploy migration
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate
```

---

## 🔍 **Verify Migration**

After running the migration, verify it worked:

```bash
# Check if new table exists
npx prisma studio

# Or query directly
npx prisma db execute --stdin <<SQL
SHOW TABLES LIKE 'delivery_locations';
SQL
```

---

## 🛠️ **If Migration Fails**

### **Common Issues:**

#### **1. Database Connection Error**
   ```bash
# Check your DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

#### **2. Existing Data Conflicts**
   ```bash
# If orders table has NULL values
# Run this first:
npx prisma db execute --stdin <<SQL
ALTER TABLE orders ADD COLUMN deliveryPhone VARCHAR(255);
SQL
```

#### **3. Permission Issues**
   ```bash
# Make sure your database user has CREATE TABLE permission
GRANT CREATE ON database_name.* TO 'your_user'@'localhost';
```

---

## 📊 **What Gets Created**

### **1. New Table: `delivery_locations`**
```sql
CREATE TABLE `delivery_locations` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `university` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `description` TEXT,
  `useCount` INT NOT NULL DEFAULT 1,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `delivery_locations_university_address_key`(`university`, `address`),
  INDEX `delivery_locations_university_useCount_idx`(`university`, `useCount`)
);
```

### **2. Modified Table: `orders`**
```sql
ALTER TABLE `orders` 
ADD COLUMN `deliveryPhone` VARCHAR(255);
```

---

## ✅ **Post-Migration Checklist**

- [ ] Migration completed without errors
- [ ] `delivery_locations` table exists
- [ ] `orders.deliveryPhone` field exists
- [ ] Prisma Client regenerated
- [ ] Development server restarted
- [ ] Can create new orders successfully
- [ ] Can view delivery locations in checkout

---

## 🔄 **Rollback (If Needed)**

If something goes wrong, you can rollback:

   ```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or manually drop the table
npx prisma db execute --stdin <<SQL
DROP TABLE IF EXISTS delivery_locations;
ALTER TABLE orders DROP COLUMN IF EXISTS deliveryPhone;
SQL
```

---

## 💡 **Tips**

1. **Always backup your database before migration**
   ```bash
   mysqldump -u user -p database_name > backup.sql
   ```

2. **Test migration on development first**
   - Never run migrations directly on production without testing

3. **Keep migration files in version control**
   - Commit the `prisma/migrations` folder

4. **Check for conflicts**
   - If working with a team, pull latest changes first

---

## 🎯 **Success Indicators**

After migration, these should work:

✅ `/api/delivery-locations` returns 200
✅ Checkout page loads without errors
✅ Can create orders with deliveryPhone
✅ Popular locations appear (after 5 uses)

---

*Last Updated: November 9, 2025*
