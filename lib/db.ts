import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get DATABASE_URL from environment
// Priority: DATABASE_URL > POSTGRES_PRISMA_URL > POSTGRES_URL
const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL is not set. Please configure it in Vercel environment variables.')
}

// Configure Prisma for connection pooling (Supabase)
const prismaClientOptions = {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
