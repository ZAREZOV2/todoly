import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { getUserPermissions } from "./permissions"

export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn("[auth][credentials] Missing email or password")
            return null
          }

          const email = credentials.email as string
          const password = credentials.password as string

          console.log("[auth][credentials] Attempt sign-in for", email)

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            console.warn("[auth][credentials] User not found for", email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          )

          if (!isPasswordValid) {
            console.warn("[auth][credentials] Invalid password for", email)
            return null
          }

          const permissions = getUserPermissions(user as any)
          console.log("[auth][credentials] Sign-in successful for", email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            permissions,
          }
        } catch (error) {
          console.error("[auth][credentials] Error during authorize", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.permissions = (user as any).permissions || []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.permissions = (token.permissions as string[]) || []
      }
      return session
    },
  },
}

const nextAuth = NextAuth(authOptions)

export const { auth, signIn, signOut, handlers } = nextAuth
