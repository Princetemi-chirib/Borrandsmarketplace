/**
 * One-off script: Remove ALL restaurant users and their data 100%.
 * - Deletes all orders (so restaurants can be removed)
 * - Deletes all restaurants (and cascade: menu, categories, inventory, etc.)
 * - Deletes all users with role RESTAURANT
 *
 * Run: npm run clear:restaurant-users  or  npx tsx scripts/clear-restaurant-users.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { dbConnect, prisma, dbDisconnect } = await import('../lib/db-prisma');
  await dbConnect();

  const restaurantUserCount = await prisma.user.count({
    where: { role: 'RESTAURANT' },
  });
  const restaurantCount = await prisma.restaurant.count();
  const orderCount = await prisma.order.count();

  console.log(`Found ${restaurantUserCount} RESTAURANT user(s), ${restaurantCount} restaurant(s), ${orderCount} order(s).`);

  if (restaurantUserCount === 0 && restaurantCount === 0) {
    console.log('No restaurant users or restaurants to clear.');
    await dbDisconnect();
    process.exit(0);
    return;
  }

  console.log('Deleting all orders...');
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} order(s).`);

  console.log('Deleting all restaurants (cascade: menu, categories, inventory, etc.)...');
  const deletedRestaurants = await prisma.restaurant.deleteMany({});
  console.log(`Deleted ${deletedRestaurants.count} restaurant(s).`);

  console.log('Deleting all users with role RESTAURANT...');
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: 'RESTAURANT' },
  });
  console.log(`Deleted ${deletedUsers.count} RESTAURANT user(s).`);

  console.log('Done. Restaurant users and related data cleared 100%.');
  await dbDisconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
