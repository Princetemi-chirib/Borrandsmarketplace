# Fix: Prisma Client "Unknown argument" Error

## Problem
After adding the `logo` field to the Prisma schema, you're getting:
```
Unknown argument `logo`. Available options are marked with ?.
```

## Solution

The Prisma client has been regenerated, but your Next.js dev server is using a **cached/old version**. You need to restart it.

### Steps:

1. **Stop your Next.js dev server** (Ctrl+C)

2. **Clear Next.js cache** (optional but recommended):
   ```bash
   rm -rf .next
   ```

3. **Regenerate Prisma client** (already done, but run again to be sure):
   ```bash
   npx prisma generate
   ```

4. **Run the database migration** (if not already done):
   ```sql
   ALTER TABLE `restaurants` ADD COLUMN `logo` VARCHAR(191) NULL AFTER `image`;
   ```
   
   Or via command line:
   ```bash
   mysql -h borrands.com.ng -P 3306 -u borrands_Temi -p'Amanillah12' borrands_Orderup -e "ALTER TABLE restaurants ADD COLUMN logo VARCHAR(191) NULL AFTER image;"
   ```

5. **Restart your Next.js dev server**:
   ```bash
   npm run dev
   ```

## Why This Happens

When you update the Prisma schema and regenerate the client:
- The new Prisma client is generated in `node_modules/@prisma/client`
- But Next.js dev server caches imports and might still use the old client
- Restarting the server forces it to reload all modules, including the new Prisma client

## Verification

After restarting, the logo field should work. Check:
- Upload a logo from `/dashboard/restaurant/profile`
- Click "Save Changes"
- You should see success message instead of error
