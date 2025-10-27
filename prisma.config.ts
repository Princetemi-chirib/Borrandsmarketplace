import { defineConfig, env } from "prisma/config";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Construct DATABASE_URL from individual variables if not provided
const getDatabaseUrl = () => {
  // Use the configured database credentials
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_DATABASE;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  
  console.log('Environment variables:', { host, port, database, username, password: password ? '[HIDDEN]' : undefined });
  
  if (!host || !port || !database || !username || !password) {
    throw new Error("Missing required database environment variables. Please set DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env.local");
  }
  
  const url = `mysql://${username}:${password}@${host}:${port}/${database}`;
  console.log('Constructed DATABASE_URL:', url);
  return url;
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
