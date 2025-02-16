"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Loader2, Eye, EyeOff, Check, X, CheckCircle } from "lucide-react"
import type React from "react"
import { useRouter } from "next/navigation"
import ReCAPTCHA from "react-google-recaptcha"
import { Magic } from "magic-sdk"
import { ethers } from "ethers"
import { WalletSignUp } from "./wallet-sign-up"

interface AuthFormProps {
  mode: "signup" | "login"
}

interface PasswordValidation {
  minLength: boolean
  maxLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

interface UsernameValidation {
  minLength: boolean
  maxLength: boolean
  validCharacters: boolean
  noSpaces: boolean
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isValidEmail, setIsValidEmail] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    maxLength: true,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  })
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [isEmailAvailable, setIsEmailAvailable] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [didToken, setDidToken] = useState<string | null>(null)
  const router = useRouter()
  const [isWalletSignUpOpen, setIsWalletSignUpOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isUsernameFocused, setIsUsernameFocused] = useState(false)
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation>({
    minLength: false,
    maxLength: false,
    validCharacters: false,
    noSpaces: false,
  })
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const [magic, setMagic] = useState<Magic | null>(null)

  useEffect(() => {
    // Initialize Magic only on the client side
    if (typeof window !== "undefined") {
      const magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)
      setMagic(magicInstance)
    }
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("signupSuccess") === "true") {
      toast({
        title: "Account Created",
        description: "Your account has been successfully created. You can now log in.",
      })
    }
  }, [toast])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsValidEmail(emailRegex.test(email))
  }

  const validatePassword = (password: string) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      maxLength: password.length <= 20,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }

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

  useEffect(() => {
    validatePassword(password)
  }, [password])

  useEffect(() => {
    validateUsername(username)
  }, [username])

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setIsUsernameAvailable(data.available)
    } catch (error) {
      console.error("Error checking username availability:", error)
    }
  }

  const checkEmailAvailability = async (email: string) => {
    if (!isValidEmail) return
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setIsEmailAvailable(data.available)
    } catch (error) {
      console.error("Error checking email availability:", error)
    }
  }

  const handleEmailVerification = async () => {
    if (!magic) {
      toast({
        title: "Error",
        description: "Authentication service is not available",
        variant: "destructive",
      })
      return
    }

    setIsVerifyingEmail(true)
    try {
      const didToken = await magic.user.getIdToken()
      if (didToken) {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ didToken }),
        })

        if (response.ok) {
          setIsEmailVerified(true)
          setOtpSent(false)
          setDidToken(didToken)
          toast({
            title: "Success",
            description: "Email verified successfully!",
          })
        } else {
          throw new Error("Email verification failed")
        }
      }
    } catch (error) {
      console.error("Email verification error:", error)
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleSendOTP = async () => {
    if (!magic) {
      toast({
        title: "Error",
        description: "Authentication service is not available",
        variant: "destructive",
      })
      return
    }

    try {
      setIsVerifyingEmail(true)
      await magic.auth.loginWithMagicLink({ email })
      setOtpSent(true)
      toast({
        title: "Success",
        description: "Magic link sent to your email. Please check your inbox and click the link to verify.",
      })
    } catch (error) {
      console.error("Error sending magic link:", error)
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleWalletConnection = async () => {
    if (walletAddress) {
      setWalletAddress(null)
    } else {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum)
          await provider.send("eth_requestAccounts", [])
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setWalletAddress(address)
        } else {
          toast({
            title: "Error",
            description: "Please install MetaMask or another Ethereum wallet.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error connecting wallet:", error)
        toast({
          title: "Error",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleWalletLogin = async () => {
    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA before connecting your wallet.",
        variant: "destructive",
      })
      return
    }

    if (!walletAddress) {
      handleWalletConnection()
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          captchaToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Redirect to task manager page
      router.push("/task-manager")
    } catch (error) {
      console.error("Wallet login error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      if (mode === "signup") {
        if (!isValidEmail || !isEmailAvailable) {
          toast({
            title: "Error",
            description: "Please enter a valid and available email address.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        if (!isUsernameAvailable) {
          toast({
            title: "Error",
            description: "Please choose a different username.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        const isPasswordValid = Object.values(passwordValidation).every(Boolean)
        if (!isPasswordValid) {
          toast({
            title: "Error",
            description: "Please ensure your password meets all requirements.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        if (!passwordsMatch) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        if (!isEmailVerified) {
          toast({
            title: "Error",
            description: "Please verify your email before signing up.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Sign up process
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            captchaToken,
            didToken,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Signup failed")
        }

        toast({
          title: "Success",
          description: "Account created successfully!",
        })

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/auth?mode=login&signupSuccess=true")
        }, 3000)
      } else {
        // Login process
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: username, // This can be either username or email
            password,
            captchaToken,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Login failed")
        }

        toast({
          title: "Success",
          description: "Logged in successfully",
        })

        // Redirect to task manager page
        router.push("/task-manager")
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
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
    <div className="w-full">
      <div className="border border-gray-200 rounded-lg p-4 min-h-[420px] relative">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="email"
              className="text-base rounded-md data-[state=active]:bg-[#F6AD37] data-[state=active]:text-white transition-colors"
            >
              Email
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="text-base text-gray-600 rounded-md data-[state=active]:bg-[#F6AD37] data-[state=active]:text-white transition-colors"
            >
              Wallet
            </TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="block text-left">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value
                    setUsername(value)
                    if (mode === "signup") {
                      validateUsername(value)
                      checkUsernameAvailability(value)
                    }
                  }}
                  onFocus={() => setIsUsernameFocused(true)}
                  onBlur={() => setTimeout(() => setIsUsernameFocused(false), 200)}
                  placeholder={mode === "login" ? "Enter your username or email" : "Enter your username"}
                  required
                  className={`border-gray-200 focus:border-[#F6AD37] focus:ring-[#F6AD37] ${
                    !isUsernameAvailable && username && mode === "signup" ? "border-red-500" : ""
                  }`}
                />
                {!isUsernameAvailable && username && mode === "signup" && (
                  <p className="text-red-500 text-sm mt-1">Username is already taken</p>
                )}
              </div>
              {mode === "signup" && (
                <div className="space-y-1.5 relative">
                  <Label htmlFor="email" className="block text-left">
                    Email
                  </Label>
                  <div className="flex items-center">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        validateEmail(e.target.value)
                        if (mode === "signup") {
                          checkEmailAvailability(e.target.value)
                        }
                      }}
                      placeholder="Enter your email id"
                      required={mode === "signup"}
                      className={`border-gray-200 focus:border-[#F6AD37] focus:ring-[#F6AD37] ${
                        (!isValidEmail || !isEmailAvailable) && email ? "border-red-500" : ""
                      }`}
                      disabled={isEmailVerified}
                    />
                    {mode === "signup" && !isEmailVerified && (
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={!isValidEmail || !isEmailAvailable || isVerifyingEmail}
                        className="ml-2 whitespace-nowrap"
                      >
                        {isVerifyingEmail ? "Sending..." : otpSent ? "Resend" : "Send Verification"}
                      </Button>
                    )}
                    {mode === "signup" && isEmailVerified && <CheckCircle className="ml-2 h-6 w-6 text-green-500" />}
                  </div>
                  {!isValidEmail && email && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  )}
                  {!isEmailAvailable && isValidEmail && email && (
                    <p className="text-red-500 text-sm mt-1">Email is already registered</p>
                  )}
                  {otpSent && !isEmailVerified && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        A verification link has been sent to your email. Please click the link to verify your email.
                      </p>
                      <Button type="button" onClick={handleEmailVerification} disabled={isVerifyingEmail}>
                        {isVerifyingEmail ? "Verifying..." : "I've clicked the link"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="block text-left">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setTimeout(() => setIsPasswordFocused(false), 200)}
                    required
                    placeholder="Enter your password"
                    className="border-gray-200 focus:border-[#F6AD37] focus:ring-[#F6AD37]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="block text-left">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setTimeout(() => setIsConfirmPasswordFocused(false), 200)}
                      required
                      placeholder="Enter your password again"
                      className={`border-gray-200 focus:border-[#F6AD37] focus:ring-[#F6AD37] ${
                        !passwordsMatch && confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {!passwordsMatch && confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>
              )}
              <div className="flex justify-center py-1">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(token: string | null) => setCaptchaToken(token)}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !captchaToken}
                className="w-full bg-[#F6AD37] hover:bg-[#F6AD37]/90 text-white font-semibold"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="wallet" className="mt-0 h-full">
            <div className="flex flex-col items-center justify-center h-[340px]">
              {walletAddress ? (
                <div className="flex flex-col items-center space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="text-sm font-medium">Connected Wallet</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <code className="px-3 py-1 bg-white rounded border border-gray-200 font-mono text-sm">
                    {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-3)}`}
                  </code>
                  <div className="space-y-4 w-full">
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={(token: string | null) => setCaptchaToken(token)}
                      />
                    </div>
                    {mode === "login" ? (
                      <Button
                        onClick={handleWalletLogin}
                        disabled={isLoading || !captchaToken}
                        className="w-full bg-[#F6AD37] hover:bg-[#F6AD37]/90 text-white"
                      >
                        {isLoading ? "Logging in..." : "Login with Wallet"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsWalletSignUpOpen(true)}
                        disabled={isLoading || !captchaToken}
                        className="w-full bg-[#F6AD37] hover:bg-[#F6AD37]/90 text-white"
                      >
                        Set Username
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleWalletConnection}
                  className="w-full bg-[#F6AD37] hover:bg-[#F6AD37]/90 text-white"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {mode === "signup" && isUsernameFocused && (
          <div className="absolute left-full top-1/3 -translate-y-1/2 ml-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64">
            <h3 className="font-semibold mb-2">Username Requirements:</h3>
            <div className="space-y-2">
              <ValidationRule satisfied={usernameValidation.minLength} label="3-15 characters long" />
              <ValidationRule satisfied={usernameValidation.maxLength} label="Maximum 15 characters" />
              <ValidationRule satisfied={usernameValidation.validCharacters} label="Letters, numbers, _ or -" />
              <ValidationRule satisfied={usernameValidation.noSpaces} label="No spaces allowed" />
            </div>
          </div>
        )}

        {/* Password validation rules */}
        {mode === "signup" && (isPasswordFocused || isConfirmPasswordFocused) && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64">
            <h3 className="font-semibold mb-2">Password Requirements:</h3>
            <div className="space-y-2">
              <ValidationRule satisfied={passwordValidation.minLength} label="8-20 characters long" />
              <ValidationRule satisfied={passwordValidation.hasUpperCase} label="One uppercase letter" />
              <ValidationRule satisfied={passwordValidation.hasLowerCase} label="One lowercase letter" />
              <ValidationRule satisfied={passwordValidation.hasNumber} label="One number" />
              <ValidationRule satisfied={passwordValidation.hasSpecial} label="One special character" />
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-center text-sm">
        {mode === "login" ? (
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth?mode=signup" className="text-[#F6AD37] hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link href="/auth?mode=login" className="text-[#F6AD37] hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
      {isWalletSignUpOpen && (
        <WalletSignUp
          address={walletAddress!}
          onClose={() => setIsWalletSignUpOpen(false)}
          onSuccess={() => router.push("/task-manager")}
        />
      )}
    </div>
  )
}

