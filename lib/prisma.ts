import { PrismaClient, Prisma } from "@prisma/client"

/**
 * Prisma singleton for Next.js App Router on Vercel with Neon (PostgreSQL) pooling.
 *
 * Key points:
 * - Uses `POSTGRES_PRISMA_URL` from Neon as the ONLY datasource URL override.
 * - Safe singleton pattern for serverless (one client per lambda in production, global in dev).
 * - Adds clearer diagnostics for common Neon misconfiguration errors (e.g. wrong project/user/tenant).
 */

type GlobalPrisma = typeof globalThis & {
  prisma?: PrismaClient
}

const globalForPrisma = globalThis as GlobalPrisma

const databaseUrl =
  process.env.NEON_POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL

if (!databaseUrl) {
  console.error(
    "❌ NEON_POSTGRES_PRISMA_URL (or POSTGRES_PRISMA_URL / DATABASE_URL) is not set. Neon pooled connection string must be provided in the environment (Vercel Project Settings / Environment Variables)."
  )
}

const prismaClientOptions: Prisma.PrismaClientOptions = {
  // Always respect Neon pooled connection string when provided.
  ...(databaseUrl
    ? {
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }
    : {}),
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as Prisma.LogLevel[])
      : (["error"] as Prisma.LogLevel[]),
}

function createPrismaClient(): PrismaClient {
  try {
    const client = new PrismaClient(prismaClientOptions)

    // Optionally you can eagerly connect in development to fail fast on bad URLs.
    if (process.env.NODE_ENV === "development") {
      client
        .$connect()
        .catch((error) => {
          console.error("❌ Failed to connect to database via Prisma (development):")
          console.error(error)
        })
    }

    return client
  } catch (error) {
    console.error("❌ Failed to initialize PrismaClient:")
    console.error(error)
    throw error
  }
}

/**
 * Export a single PrismaClient instance.
 *
 * - In development, attach to `globalThis` to survive hot reloads.
 * - In production (Vercel serverless), rely on one client per lambda instance.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
