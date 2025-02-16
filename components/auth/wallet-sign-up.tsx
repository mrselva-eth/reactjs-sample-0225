"use client"

import type React from "react"
import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Check, X } from "lucide-react"

interface WalletSignUpProps {
  address: string
  onClose: () => void
  onSuccess: () => void
}

interface UsernameValidation {
  minLength: boolean
  maxLength: boolean
  validCharacters: boolean
  noSpaces: boolean
}

export function WalletSignUp({ address, onClose, onSuccess }: WalletSignUpProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUsernameFocused, setIsUsernameFocused] = useState(false)
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation>({
    minLength: false,
    maxLength: false,
    validCharacters: false,
    noSpaces: false,
  })
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true) // Added state for username availability
  const { toast } = useToast()

  const validateUsername = (username: string) => {
    if (!username) {
      setUsernameValidation({
        minLength: false,
        maxLength: false,
        validCharacters: false,
        noSpaces: false,
      })
      return
    }

    setUsernameValidation({
      minLength: username.length >= 3,
      maxLength: username.length <= 15,
      validCharacters: /^[a-zA-Z0-9_-]*$/.test(username),
      noSpaces: !username.includes(" "),
    })
  }

  const checkUsernameAvailability = async (username: string) => {
    // Added function to check username availability
    if (username.length < 3) return
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setIsUsernameAvailable(data.available)
    } catch (error) {
      console.error("Error checking username availability:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check if all validation rules are satisfied and username is available
    const isValid = Object.values(usernameValidation).every(Boolean) && isUsernameAvailable
    if (!isValid) {
      toast({
        title: "Error",
        description: isUsernameAvailable
          ? "Please ensure your username meets all requirements."
          : "This username is already taken. Please choose another.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/wallet-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, address }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Wallet account created successfully!",
        })
        onSuccess()
      } else {
        throw new Error(data.error || "Failed to create wallet account")
      }
    } catch (error) {
      console.error("Wallet signup error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create wallet account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ValidationRule = ({ satisfied, label }: { satisfied: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      {satisfied ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className={`text-sm ${satisfied ? "text-green-500" : "text-red-500"}`}>{label}</span>
    </div>
  )

  return (
    <Modal isOpen={true} onClose={onClose} title="Set Username for Wallet Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              const value = e.target.value
              setUsername(value)
              validateUsername(value)
              checkUsernameAvailability(value) // Added call to checkUsernameAvailability
            }}
            onFocus={() => setIsUsernameFocused(true)}
            onBlur={() => setTimeout(() => setIsUsernameFocused(false), 200)}
            required
            placeholder="Enter your username"
            className={`border-gray-200 focus:border-[#F6AD37] focus:ring-[#F6AD37] ${
              !isUsernameAvailable && username ? "border-red-500" : "" // Added conditional class for red border
            }`}
          />
          {isUsernameFocused && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-8 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-50">
              <h3 className="font-semibold mb-2">Username Requirements:</h3>
              <div className="space-y-2">
                <ValidationRule satisfied={usernameValidation.minLength} label="3-15 characters long" />
                <ValidationRule satisfied={usernameValidation.maxLength} label="Maximum 15 characters" />
                <ValidationRule satisfied={usernameValidation.validCharacters} label="Letters, numbers, _ or -" />
                <ValidationRule satisfied={usernameValidation.noSpaces} label="No spaces allowed" />
              </div>
            </div>
          )}
          {!isUsernameAvailable &&
            username && ( // Added UI feedback for username availability
              <p className="text-red-500 text-sm mt-1">Username is already taken</p>
            )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Modal>
  )
}

