#!/usr/bin/env node

import { execSync } from 'child_process';

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'migrate':
        console.log('🔄 Running Prisma migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations completed');
        break;
        
      case 'rollback':
        console.log('⚠️ Prisma does not support rollbacks. Use migrate:reset instead.');
        console.log('Run: npx prisma migrate reset');
        break;
        
      case 'status':
        console.log('📊 Checking migration status...');
        execSync('npx prisma migrate status', { stdio: 'inherit' });
        break;
        
      case 'reset':
        console.log('🔄 Resetting database...');
        execSync('npx prisma migrate reset', { stdio: 'inherit' });
        break;
        
      default:
        console.log(`
🔄 Prisma Migration Tool

Usage:
  npm run migrate          # Apply all pending migrations
  npm run migrate:status   # Show migration status
  npm run migrate:reset    # Reset database and apply migrations

Commands:
  migrate                  Apply all pending migrations
  status                   Show current migration status
  reset                    Reset database and apply all migrations
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();