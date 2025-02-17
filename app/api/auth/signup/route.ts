import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const { username, email, password, captchaToken } = await req.json()

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

    // Check if username or email already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      method: "email",
      createdAt: new Date(),
      tasks: [],
    }

    await db.collection("users").insertOne(newUser)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Signup failed",
      },
      { status: 500 },
    )
  }
}

