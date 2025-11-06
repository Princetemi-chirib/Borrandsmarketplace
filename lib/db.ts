// This file is deprecated - use lib/db-prisma.ts instead
// Redirecting to Prisma connection for MySQL

import { dbConnect as prismaDbConnect, checkDatabaseHealth as prismaCheckDatabaseHealth } from './db-prisma';

// Redirect MongoDB functions to Prisma equivalents
export const dbConnect = prismaDbConnect;
export const checkDatabaseHealth = prismaCheckDatabaseHealth;

export default dbConnect;