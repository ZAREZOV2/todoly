"use client"

import Link from "next/link"
import { useSessionWithPermissions } from "@/lib/use-session"
import { Button, Card, Text } from "@gravity-ui/uikit"

export default function AdminPage() {
  const { data: session } = useSessionWithPermissions()
  const canManageUsers = session?.user?.permissions?.includes("users.manage")
  const canManageRoles = session?.user?.permissions?.includes("roles.manage")

  return (
    <div style={{ minHeight: "100vh", background: "var(--g-color-base-background)" }}>
      <div
        style={{
          background: "var(--g-color-base-float)",
          borderBottom: "1px solid var(--g-color-line-generic)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="header-1">Admin Panel</Text>
          <Button view="outlined" size="m" href="/">
            Back to Board
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 32px" }}>
        <Card view="outlined" style={{ padding: 24 }}>
          <Text variant="header-2" style={{ marginBottom: 20, display: "block" }}>
            Administration
          </Text>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {canManageUsers && (
              <Link href="/admin/users" style={{ textDecoration: "none" }}>
                <Card
                  view="outlined"
                  style={{ padding: 20, cursor: "pointer" }}
                >
                  <Text variant="subheader-3" style={{ marginBottom: 8, display: "block" }}>
                    User Management
                  </Text>
                  <Text variant="body-2" color="secondary">
                    Manage users, assign roles, and edit user information
                  </Text>
                </Card>
              </Link>
            )}

            {canManageRoles && (
              <Link href="/admin/roles" style={{ textDecoration: "none" }}>
                <Card
                  view="outlined"
                  style={{ padding: 20, cursor: "pointer" }}
                >
                  <Text variant="subheader-3" style={{ marginBottom: 8, display: "block" }}>
                    Role Management
                  </Text>
                  <Text variant="body-2" color="secondary">
                    Create and manage roles, assign permissions to roles
                  </Text>
                </Card>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
