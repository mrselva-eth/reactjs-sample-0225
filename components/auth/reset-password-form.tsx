"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { magic } from "@/lib/magic"
import { useRouter } from "next/navigation"
import type React from "react" // Added import for React

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!magic) throw new Error("Magic SDK is not available")

      await magic.auth.loginWithMagicLink({
        email,
        showUI: false,
        redirectURI: new URL("/update-password", window.location.origin).href,
      })

      toast({
        title: "Success",
        description: "Password reset link sent. Please check your email.",
      })

      // Redirect to login page after a short delay
      setTimeout(() => router.push("/auth"), 3000)
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email address"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Sending..." : "Reset Password"}
      </Button>
    </form>
  )
}

