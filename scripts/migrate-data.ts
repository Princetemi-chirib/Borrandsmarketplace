#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface DatabaseConfig {
  uri: string;
  name: string;
}

class DatabaseMigrator {
  private sourceDb: mongoose.Connection | null = null;
  private targetDb: mongoose.Connection | null = null;

  async connectToSource(sourceUri: string): Promise<void> {
    console.log('🔌 Connecting to source database...');
    this.sourceDb = await mongoose.createConnection(sourceUri);
    console.log('✅ Connected to source database');
  }

  async connectToTarget(targetUri: string): Promise<void> {
    console.log('🔌 Connecting to target database...');
    this.targetDb = await mongoose.createConnection(targetUri);
    console.log('✅ Connected to target database');
  }

  async migrateCollection(collectionName: string): Promise<void> {
    if (!this.sourceDb || !this.targetDb) {
      throw new Error('Database connections not established');
    }

    console.log(`📦 Migrating collection: ${collectionName}`);

    try {
      // Get all documents from source
      const sourceCollection = this.sourceDb.collection(collectionName);
      const documents = await sourceCollection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`⚠️ No documents found in ${collectionName}`);
        return;
      }

      // Insert into target database
      const targetCollection = this.targetDb.collection(collectionName);
      
      // Clear existing data in target (optional - remove if you want to merge)
      await targetCollection.deleteMany({});
      
      // Insert documents in batches
      const batchSize = 1000;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await targetCollection.insertMany(batch, { ordered: false });
        console.log(`  📄 Migrated ${Math.min(i + batchSize, documents.length)}/${documents.length} documents`);
      }

      console.log(`✅ Successfully migrated ${documents.length} documents from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error migrating ${collectionName}:`, error);
      throw error;
    }
  }

  async getCollections(): Promise<string[]> {
    if (!this.sourceDb) {
      throw new Error('Source database connection not established');
    }

    const collections = await this.sourceDb.db.listCollections().toArray();
    return collections.map(col => col.name);
  }

  async validateMigration(): Promise<void> {
    if (!this.sourceDb || !this.targetDb) {
      throw new Error('Database connections not established');
    }

    console.log('🔍 Validating migration...');

    const collections = await this.getCollections();
    
    for (const collectionName of collections) {
      const sourceCount = await this.sourceDb.collection(collectionName).countDocuments();
      const targetCount = await this.targetDb.collection(collectionName).countDocuments();
      
      if (sourceCount === targetCount) {
        console.log(`✅ ${collectionName}: ${sourceCount} documents (match)`);
      } else {
        console.log(`❌ ${collectionName}: Source=${sourceCount}, Target=${targetCount} (mismatch)`);
      }
    }
  }

  async close(): Promise<void> {
    if (this.sourceDb) {
      await this.sourceDb.close();
      console.log('🔌 Source database connection closed');
    }
    if (this.targetDb) {
      await this.targetDb.close();
      console.log('🔌 Target database connection closed');
    }
  }
}

async function main() {
  const migrator = new DatabaseMigrator();
  
  try {
    // Get database URIs from command line arguments or environment
    const sourceUri = process.argv[2] || process.env.SOURCE_MONGODB_URI;
    const targetUri = process.argv[3] || process.env.TARGET_MONGODB_URI;

    if (!sourceUri || !targetUri) {
      console.log(`
🔄 Database Migration Tool

Usage:
  node scripts/migrate-data.js <source_uri> <target_uri>
  
  Or set environment variables:
  SOURCE_MONGODB_URI=mongodb://localhost:27017/borrands
  TARGET_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/borrands

Examples:
  # Migrate from local to MongoDB Atlas
  node scripts/migrate-data.js mongodb://localhost:27017/borrands mongodb+srv://user:pass@cluster.mongodb.net/borrands
  
  # Migrate using environment variables
  SOURCE_MONGODB_URI=mongodb://localhost:27017/borrands \\
  TARGET_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/borrands \\
  node scripts/migrate-data.js
      `);
      process.exit(1);
    }

    console.log('🚀 Starting database migration...');
    console.log(`📤 Source: ${sourceUri.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`📥 Target: ${targetUri.replace(/\/\/.*@/, '//***:***@')}`);

    // Connect to both databases
    await migrator.connectToSource(sourceUri);
    await migrator.connectToTarget(targetUri);

    // Get all collections
    const collections = await migrator.getCollections();
    console.log(`📋 Found ${collections.length} collections to migrate`);

    // Migrate each collection
    for (const collectionName of collections) {
      await migrator.migrateCollection(collectionName);
    }

    // Validate migration
    await migrator.validateMigration();

    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

main();
