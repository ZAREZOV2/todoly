// Lightweight auth for Edge Runtime (middleware)
// This version doesn't import Prisma to reduce bundle size

import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function getSessionFromToken(req: NextRequest) {
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token) {
    return null
  }

  return {
    user: {
      id: token.id as string,
      email: token.email as string,
      name: token.name as string | null,
      permissions: (token.permissions as string[]) || [],
    },
  }
}
