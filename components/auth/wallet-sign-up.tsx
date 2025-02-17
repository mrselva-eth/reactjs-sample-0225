"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import ReCAPTCHA from "react-google-recaptcha"
import { ethers } from "ethers"

interface WalletSignUpProps {
  onSuccess: () => void
}

export function WalletSignUp({ onSuccess }: WalletSignUpProps) {
  const [username, setUsername] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setWalletAddress(address)
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        toast({
          title: "Error",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Error",
        description: "Please install MetaMask or another Ethereum wallet.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA.",
        variant: "destructive",
      })
      return
    }
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/wallet-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, walletAddress, captchaToken }),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <Button type="button" onClick={connectWallet} disabled={!!walletAddress}>
        {walletAddress ? "Wallet Connected" : "Connect Wallet"}
      </Button>
      {walletAddress && (
        <p className="text-sm text-muted-foreground">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </p>
      )}
      <div className="flex justify-center">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={(token: string | null) => setCaptchaToken(token)}
        />
      </div>
      <Button type="submit" disabled={isLoading || !captchaToken || !walletAddress}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}

