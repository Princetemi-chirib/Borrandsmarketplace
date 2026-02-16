/**
 * Script: Count restaurants (and related stats) in the database.
 *
 * Run: npm run count:restaurants  or  npx tsx scripts/count-restaurants.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { dbConnect, prisma, dbDisconnect } = await import('../lib/db-prisma');
  await dbConnect();

  const restaurantCount = await prisma.restaurant.count();
  const orderCount = await prisma.order.count();

  console.log('--- Restaurant count ---');
  console.log('Restaurants:', restaurantCount);
  console.log('Orders (total):', orderCount);

  if (restaurantCount > 0) {
    const restaurants = await prisma.restaurant.findMany({
      select: { id: true, name: true, status: true, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log('\nRestaurants in DB:');
    restaurants.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (status: ${r.status}, active: ${r.isActive})`);
    });
  }

  await dbDisconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
