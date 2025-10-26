import mongoose from 'mongoose';
import dbConnect from '../db';

export interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking collection
const migrationSchema = new mongoose.Schema({
  version: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
  rollbackAt: { type: Date },
});

const MigrationModel = mongoose.models.Migration || mongoose.model('Migration', migrationSchema);

export class MigrationManager {
  private migrations: Migration[] = [];

  register(migration: Migration) {
    this.migrations.push(migration);
  }

  async getAppliedMigrations(): Promise<number[]> {
    await dbConnect();
    const applied = await MigrationModel.find({}).sort({ version: 1 });
    return applied.map(m => m.version);
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const applied = await this.getAppliedMigrations();
    return this.migrations.filter(m => !applied.includes(m.version));
  }

  async migrate(): Promise<void> {
    console.log('🔄 Starting database migrations...');
    
    const pending = await this.getPendingMigrations();
    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📋 Found ${pending.length} pending migrations`);

    for (const migration of pending) {
      try {
        console.log(`⏳ Applying migration ${migration.version}: ${migration.name}`);
        await migration.up();
        
        await MigrationModel.create({
          version: migration.version,
          name: migration.name,
        });
        
        console.log(`✅ Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully');
  }

  async rollback(targetVersion?: number): Promise<void> {
    console.log('🔄 Starting database rollback...');
    
    const applied = await this.getAppliedMigrations();
    const migrationsToRollback = this.migrations
      .filter(m => applied.includes(m.version))
      .sort((a, b) => b.version - a.version);

    if (targetVersion) {
      const targetIndex = migrationsToRollback.findIndex(m => m.version <= targetVersion);
      if (targetIndex !== -1) {
        migrationsToRollback.splice(targetIndex + 1);
      }
    }

    for (const migration of migrationsToRollback) {
      try {
        console.log(`⏳ Rolling back migration ${migration.version}: ${migration.name}`);
        await migration.down();
        
        await MigrationModel.findOneAndUpdate(
          { version: migration.version },
          { rollbackAt: new Date() }
        );
        
        console.log(`✅ Migration ${migration.version} rolled back successfully`);
      } catch (error) {
        console.error(`❌ Rollback ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All rollbacks completed successfully');
  }

  async status(): Promise<void> {
    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();

    console.log('\n📊 Migration Status:');
    console.log(`✅ Applied: ${applied.length}`);
    console.log(`⏳ Pending: ${pending.length}`);
    
    if (pending.length > 0) {
      console.log('\n📋 Pending migrations:');
      pending.forEach(m => {
        console.log(`  - ${m.version}: ${m.name}`);
      });
    }
  }
}

// Global migration manager instance
export const migrationManager = new MigrationManager();
