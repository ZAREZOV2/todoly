"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSessionWithPermissions } from "@/lib/use-session"
import { authClient } from "@/lib/auth-client"
import {
  Button,
  Text,
  TextInput,
  Card,
  Spin,
  Label,
} from "@gravity-ui/uikit"
import { useAppTheme } from "@/components/GravityProvider"

export default function ProfilePage() {
  const { data: session, status } = useSessionWithPermissions()
  const router = useRouter()
  const { theme, toggleTheme } = useAppTheme()

  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState("")

  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdError, setPwdError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [status, session, router])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setNameLoading(true)
    setNameError("")
    setNameSuccess(false)
    try {
      // Better Auth user update
      await (authClient as any).updateUser({ name })
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    } catch {
      setNameError("Failed to update name. Please try again.")
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setPwdError("Password must be at least 8 characters")
      return
    }
    setPwdLoading(true)
    setPwdError("")
    setPwdSuccess(false)
    try {
      await (authClient as any).changePassword({
        currentPassword,
        newPassword,
      })
      setPwdSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch {
      setPwdError("Failed to change password. Check your current password.")
    } finally {
      setPwdLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--g-color-base-background)",
        }}
      >
        <Spin size="xl" />
      </div>
    )
  }

  const roleTheme: Record<string, "normal" | "info" | "warning" | "danger"> = {
    ADMIN: "danger",
    MANAGER: "warning",
    USER: "info",
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--g-color-base-background)" }}>
      {/* Nav */}
      <div
        style={{
          background: "var(--g-color-base-float)",
          borderBottom: "1px solid var(--g-color-line-generic)",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button view="flat" href="/">← Back to Board</Button>
          <Text variant="header-1">Profile</Text>
          <Button view="flat" size="m" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 48px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Account Info */}
        <Card view="outlined" style={{ padding: 24 }}>
          <Text variant="subheader-3" style={{ display: "block", marginBottom: 16 }}>
            Account
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text variant="body-2" color="secondary" style={{ minWidth: 60 }}>Email:</Text>
              <Text variant="body-2">{session?.user?.email}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text variant="body-2" color="secondary" style={{ minWidth: 60 }}>Role:</Text>
              <Label theme={roleTheme[(session?.user as any)?.role ?? "USER"] ?? "info"} size="s">
                {(session?.user as any)?.role ?? "USER"}
              </Label>
            </div>
          </div>
        </Card>

        {/* Update Name */}
        <Card view="outlined" style={{ padding: 24 }}>
          <Text variant="subheader-3" style={{ display: "block", marginBottom: 16 }}>
            Display Name
          </Text>
          <form onSubmit={handleUpdateName}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextInput
                label="Name"
                value={name}
                onUpdate={setName}
                placeholder="Your display name"
                size="l"
                hasClear
              />
              {nameError && (
                <Text variant="body-2" style={{ color: "var(--g-color-text-danger)" }}>
                  {nameError}
                </Text>
              )}
              {nameSuccess && (
                <Text variant="body-2" style={{ color: "var(--g-color-text-positive)" }}>
                  Name updated successfully!
                </Text>
              )}
              <div>
                <Button
                  type="submit"
                  view="action"
                  size="m"
                  loading={nameLoading}
                  disabled={nameLoading || !name.trim()}
                >
                  Save Name
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card view="outlined" style={{ padding: 24 }}>
          <Text variant="subheader-3" style={{ display: "block", marginBottom: 16 }}>
            Change Password
          </Text>
          <form onSubmit={handleChangePassword}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextInput
                label="Current Password"
                type="password"
                value={currentPassword}
                onUpdate={setCurrentPassword}
                placeholder="Current password"
                size="l"
              />
              <TextInput
                label="New Password"
                type="password"
                value={newPassword}
                onUpdate={setNewPassword}
                placeholder="New password (min 8 chars)"
                size="l"
              />
              <TextInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onUpdate={setConfirmPassword}
                placeholder="Repeat new password"
                size="l"
              />
              {pwdError && (
                <Text variant="body-2" style={{ color: "var(--g-color-text-danger)" }}>
                  {pwdError}
                </Text>
              )}
              {pwdSuccess && (
                <Text variant="body-2" style={{ color: "var(--g-color-text-positive)" }}>
                  Password changed successfully!
                </Text>
              )}
              <div>
                <Button
                  type="submit"
                  view="action"
                  size="m"
                  loading={pwdLoading}
                  disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Danger zone */}
        <Card view="outlined" style={{ padding: 24, borderColor: "var(--g-color-line-danger)" }}>
          <Text variant="subheader-3" style={{ display: "block", marginBottom: 8 }}>
            Session
          </Text>
          <Button
            view="outlined-danger"
            size="m"
            onClick={async () => {
              await authClient.signOut()
              window.location.href = "/login"
            }}
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  )
}
