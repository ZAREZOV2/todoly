import { createAuthClient } from "better-auth/react"

// Omit baseURL to use same-origin, or set NEXT_PUBLIC_APP_URL for custom domain
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? undefined,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
