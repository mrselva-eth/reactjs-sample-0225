import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { email, password, captchaToken } = await req.json()

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

    const client = await clientPromise
    const db = client.db("atm_database")

    // Find user by email
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("user_session", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 },
    )
  }
}

