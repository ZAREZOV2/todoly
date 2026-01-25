import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { getUserPermissions } from "./permissions"

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          permissions: getUserPermissions(user as any),
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
