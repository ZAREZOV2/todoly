import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get STORAGE_POSTGRES_URL from environment (Supabase via Vercel)
const databaseUrl = process.env.STORAGE_POSTGRES_URL

if (!databaseUrl) {
  console.warn('⚠️ STORAGE_POSTGRES_URL is not set. Please configure it in Vercel environment variables.')
}

// Configure Prisma for connection pooling (Supabase)
const prismaClientOptions: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? (['query', 'error', 'warn'] as Prisma.LogLevel[])
    : (['error'] as Prisma.LogLevel[]),
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
