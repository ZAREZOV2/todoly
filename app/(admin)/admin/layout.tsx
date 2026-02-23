"use client"

import { useSessionWithPermissions } from "@/lib/use-session"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSessionWithPermissions()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    const permissions = session.user?.permissions || []
    if (
      !permissions.includes("users.manage") &&
      !permissions.includes("roles.manage")
    ) {
      router.push("/")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
