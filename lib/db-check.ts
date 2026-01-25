// Utility to check database connection
import { prisma } from "./db"

export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}
