"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const AuthForm = dynamic(() => import("./auth-form").then((mod) => mod.AuthForm), { ssr: false })

export const AuthFormWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthFormContent />
    </Suspense>
  )
}

const AuthFormContent = () => {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") as "login" | "signup" | null

  return <AuthForm mode={mode || "login"} />
}

