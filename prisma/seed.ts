import { PrismaClient } from "@prisma/client"
import * as crypto from "crypto"

const prisma = new PrismaClient()

// Better Auth hashes passwords with its own format; for seed we use a simple hash.
// In production, users register via signUp.email. This seed creates user + account manually.
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log("Seeding database...")

  const adminId = crypto.randomUUID()
  const adminEmail = "admin@example.com"
  const adminPassword = "admin123"

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: adminId,
      name: "Admin User",
      email: adminEmail,
      emailVerified: false,
      role: "ADMIN",
    },
  })

  const existingAccount = await prisma.account.findFirst({
    where: { userId: adminId, providerId: "credential" },
  })
  if (!existingAccount) {
    const hashedPassword = await hashPassword(adminPassword)
    await prisma.account.create({
      data: {
        userId: adminId,
        accountId: adminId,
        providerId: "credential",
        password: hashedPassword,
      },
    })
  }

  console.log(
    "Created admin user: admin@example.com / admin123 with role ADMIN"
  )
  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
