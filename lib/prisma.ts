// This file sets up and exports a Prisma Client instance for database access.
// 1. Imports the `PrismaClient` class from the `@prisma/client` package.
// 2. Uses a global variable (`globalForPrisma`) to store the Prisma Client instance.
//    - This prevents creating multiple instances in development, which can cause issues.
// 3. Creates a new Prisma Client instance if one doesn't already exist.
// 4. In non-production environments, stores the Prisma Client instance globally.
// 5. Exports the Prisma Client instance for use throughout the application.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
