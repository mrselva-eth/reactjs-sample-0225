import { NextResponse } from "next/server"
import { getUserData, verifyPassword } from "@/lib/ipfs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { identifier, password, captchaToken, walletAddress } = await req.json()

    // Verify ReCAPTCHA
    const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    })

    const recaptchaData = await recaptchaResponse.json()
    if (!recaptchaData.success) {
      return NextResponse.json({ error: "Invalid ReCAPTCHA" }, { status: 400 })
    }

    let userData

    if (walletAddress) {
      // Wallet-based login
      userData = await getUserData(walletAddress)
      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    } else {
      // Email-based login
      userData = await getUserData(identifier)
      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Verify password
      const isValid = await verifyPassword(password, userData.password!)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("user_session", userData.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      success: true,
      username: userData.username,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

