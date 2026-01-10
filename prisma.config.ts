import { defineConfig, env } from "prisma/config";
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Try to load environment variables from multiple possible locations
const envFiles = ['.env.local', '.env', 'env.local'];
for (const envFile of envFiles) {
  const envPath = resolve(process.cwd(), envFile);
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

// Construct DATABASE_URL from individual variables if not provided
const getDatabaseUrl = () => {
  // First, check if DATABASE_URL is already set
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Otherwise, try to construct from individual variables
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_DATABASE;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  
  console.log('Environment variables:', { host, port, database, username, password: password ? '[HIDDEN]' : undefined });
  
  // If all individual variables are present, construct the URL
  if (host && port && database && username && password) {
    const url = `mysql://${username}:${password}@${host}:${port}/${database}`;
    console.log('Constructed DATABASE_URL:', url);
    return url;
  }
  
  // For prisma generate, we can use a dummy connection string
  // This allows the postinstall script to run even without a real database
  if (process.env.NODE_ENV !== 'production' || process.argv.includes('generate')) {
    console.warn('⚠️  No database configuration found. Using dummy connection string for Prisma generation.');
    console.warn('⚠️  Please set DATABASE_URL or DB_* variables in .env.local before running migrations.');
    return 'mysql://user:password@localhost:3306/database';
  }
  
  // In production or for migrations, require proper configuration
  throw new Error("Missing required database environment variables. Please set DATABASE_URL or DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env.local");
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: getDatabaseUrl(),
  },
});
