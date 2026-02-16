/**
 * Script: Count users (and list by role) in the database.
 *
 * Run: npm run count:users  or  npx tsx scripts/count-users.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const { dbConnect, prisma, dbDisconnect } = await import('../lib/db-prisma');
  await dbConnect();

  const total = await prisma.user.count();
  const byRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  });

  console.log('--- Users in DB ---');
  console.log('Total users:', total);
  console.log('\nBy role:');
  byRole.forEach((r) => {
    console.log(`  ${r.role}: ${r._count.id}`);
  });

  if (total > 0) {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
    console.log('\nAll users:');
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name} (${u.email}) | ${u.role} | active: ${u.isActive}`);
    });
  }

  await dbDisconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
