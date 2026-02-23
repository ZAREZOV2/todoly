"use client"

import Link from "next/link"
import { RoleManagement } from "@/components/admin/RoleManagement"
import { Button, Text } from "@gravity-ui/uikit"

export default function AdminRolesPage() {
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
        <div style={{ marginBottom: 16 }}>
          <Link href="/admin" style={{ color: "var(--g-color-text-link)", textDecoration: "none" }}>
            ← Back to Admin
          </Link>
        </div>
        <RoleManagement />
      </div>
    </div>
  )
}
