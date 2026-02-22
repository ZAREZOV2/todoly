"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Button,
  Card,
  Text,
  TextInput,
  Alert,
} from "@gravity-ui/uikit"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
        rememberMe: true,
      })

      if (result.error) {
        setError(result.error.message ?? "Invalid email or password")
        return
      }

      if (result.data) {
        router.replace("/")
      }
    } catch (err) {
      console.error("signIn error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--g-color-base-background)",
        padding: "16px",
      }}
    >
      <Card
        style={{ width: "100%", maxWidth: 400, padding: 32 }}
        view="outlined"
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <Text variant="display-2" as="h1">
            Todoly
          </Text>
          <Text variant="body-2" color="secondary" style={{ marginTop: 8 }}>
            Sign in to your account
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && (
              <Alert
                theme="danger"
                title="Sign in failed"
                message={error}
              />
            )}

            <TextInput
              label="Email"
              type="email"
              value={email}
              onUpdate={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              size="l"
              hasClear
            />

            <TextInput
              label="Password"
              type="password"
              value={password}
              onUpdate={setPassword}
              placeholder="Your password"
              autoComplete="current-password"
              size="l"
            />

            <Button
              type="submit"
              view="action"
              size="l"
              width="max"
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>

            <Text
              variant="body-2"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "var(--g-color-text-link)" }}>
                Register
              </Link>
            </Text>
          </div>
        </form>
      </Card>
    </div>
  )
}
