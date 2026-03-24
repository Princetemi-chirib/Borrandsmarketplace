/**
 * One-off script: Clear all riders, students, restaurants, and their dependent data.
 *
 * Deletion order (respects foreign keys):
 * 1. Orders (reference students, restaurants, riders)
 * 2. Riders
 * 3. Restaurants (cascade: categories, menu items, inventory, payouts, etc.)
 * 4. Users with role STUDENT, RIDER, or RESTAURANT
 *
 * Admin users are NOT deleted.
 *
 * Run: npm run clear:riders-students-restaurants
 *   or: npx tsx scripts/clear-riders-students-restaurants.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { dbConnect, prisma, dbDisconnect } = await import('../lib/db-prisma');
  await dbConnect();

  const [orderCount, riderCount, restaurantCount, studentCount, restaurantUserCount, riderUserCount] =
    await Promise.all([
      prisma.order.count(),
      prisma.rider.count(),
      prisma.restaurant.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'RESTAURANT' } }),
      prisma.user.count({ where: { role: 'RIDER' } }),
    ]);

  console.log('Current counts:');
  console.log(`  Orders: ${orderCount}`);
  console.log(`  Riders: ${riderCount} (${riderUserCount} RIDER users)`);
  console.log(`  Restaurants: ${restaurantCount} (${restaurantUserCount} RESTAURANT users)`);
  console.log(`  Students: ${studentCount} STUDENT users`);
  console.log('');

  const hasAny =
    orderCount > 0 || riderCount > 0 || restaurantCount > 0 || studentCount > 0;
  if (!hasAny) {
    console.log('Nothing to clear.');
    await dbDisconnect();
    process.exit(0);
    return;
  }

  console.log('Deleting in order: Orders → Riders → Restaurants → Users (STUDENT, RIDER, RESTAURANT)...');
  console.log('');

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} order(s).`);

  const deletedRiders = await prisma.rider.deleteMany({});
  console.log(`Deleted ${deletedRiders.count} rider(s).`);

  const deletedRestaurants = await prisma.restaurant.deleteMany({});
  console.log(`Deleted ${deletedRestaurants.count} restaurant(s) (cascade: menu, categories, inventory, etc.).`);

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: { in: ['STUDENT', 'RIDER', 'RESTAURANT'] },
    },
  });
  console.log(`Deleted ${deletedUsers.count} user(s) (STUDENT, RIDER, RESTAURANT).`);

  console.log('');
  console.log('Done. Riders, students, and restaurants (and orders) cleared. Admin users kept.');
  await dbDisconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

