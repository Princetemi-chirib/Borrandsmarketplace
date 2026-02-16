/**
 * One-off script: Delete all orders then all restaurants from the database.
 * Restaurant owners (Users) are left intact; only restaurant records and
 * their related data (menu, categories, inventory, etc.) and all orders are removed.
 *
 * Run: npm run clear:restaurants  or  npx tsx scripts/clear-restaurants.ts
 */

import { config } from 'dotenv';

// Load .env.local first (Next.js convention), then .env, so DATABASE_URL is set before Prisma is imported
config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { dbConnect, prisma, dbDisconnect } = await import('../lib/db-prisma');
  await dbConnect();

  const orderCount = await prisma.order.count();
  const restaurantCount = await prisma.restaurant.count();

  console.log(`Found ${orderCount} order(s) and ${restaurantCount} restaurant(s).`);

  if (orderCount === 0 && restaurantCount === 0) {
    console.log('Nothing to clear.');
    await dbDisconnect();
    process.exit(0);
    return;
  }

  console.log('Deleting all orders (required before deleting restaurants)...');
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} order(s).`);

  console.log('Deleting all restaurants (cascade will remove menu, categories, inventory, etc.)...');
  const deletedRestaurants = await prisma.restaurant.deleteMany({});
  console.log(`Deleted ${deletedRestaurants.count} restaurant(s).`);

  console.log('Done.');
  await dbDisconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
