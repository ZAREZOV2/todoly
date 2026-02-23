"use client"

import { authClient } from "@/lib/auth-client"
import { getUserPermissions } from "@/lib/permissions"

export type SessionUser = {
  id: string
  email: string
  name: string | null
  image?: string | null
  role?: string
  permissions: string[]
}

export type SessionWithPermissions = {
  user: SessionUser
  session: { id: string; userId: string; token: string; expiresAt: Date }
} | null

export function useSessionWithPermissions() {
  const { data: session, isPending, error } = authClient.useSession()
  const user = session?.user
  const permissions = getUserPermissions(user as { role?: string } | null)
  
  // Ensure all required fields are present
  const sessionWithPermissions: SessionWithPermissions =
    session?.user?.id && session?.user?.email && session?.session
      ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name ?? null,
            image: session.user.image ?? null,
            role: (session.user as any).role ?? undefined,
            permissions,
          },
          session: session.session,
        }
      : null
      
  return {
    data: sessionWithPermissions,
    status: isPending ? "loading" : sessionWithPermissions ? "authenticated" : "unauthenticated",
    isPending,
    error,
  }
}
