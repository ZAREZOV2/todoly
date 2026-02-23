import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { getUserPermissions } from "./permissions"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
})

export type Auth = typeof auth

/** Session with permissions derived from user.role. Use in API routes. */
export async function getSessionWithPermissions(headers: Headers): Promise<{
  user: { id: string; email: string; name: string | null; role?: string; permissions: string[] }
  session: { id: string; userId: string; token: string; expiresAt: Date }
} | null> {
  const session = await auth.api.getSession({ headers })
  if (!session) return null
  const userRole = session.user.role ?? undefined
  const permissions = getUserPermissions({ role: userRole })
  return {
    ...session,
    user: {
      ...session.user,
      role: userRole,
      permissions,
    },
  }
}
