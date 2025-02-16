"use client"

import { useSearchParams } from "next/navigation"
import { AuthForm } from "./auth-form"

export function AuthFormClient() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") as "login" | "signup" | null

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "signup" ? "Create an account" : "Welcome back"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {mode === "signup"
          ? "Enter your details below to create your account"
          : "Enter your credentials below to login to your account"}
      </p>
      <AuthForm mode={mode || "login"} />
    </>
  )
}

