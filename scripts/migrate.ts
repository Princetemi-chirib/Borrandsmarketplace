#!/usr/bin/env node

import { migrationManager } from './lib/migrations/index';
import './lib/migrations/001-initial-setup';

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'migrate':
        await migrationManager.migrate();
        break;
        
      case 'rollback':
        const targetVersion = process.argv[3] ? parseInt(process.argv[3]) : undefined;
        await migrationManager.rollback(targetVersion);
        break;
        
      case 'status':
        await migrationManager.status();
        break;
        
      default:
        console.log(`
🔄 Database Migration Tool

Usage:
  npm run migrate          # Apply all pending migrations
  npm run migrate:status   # Show migration status
  npm run migrate:rollback [version] # Rollback to specific version

Commands:
  migrate                  Apply all pending migrations
  rollback [version]       Rollback to specific version (or latest)
  status                   Show current migration status
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
