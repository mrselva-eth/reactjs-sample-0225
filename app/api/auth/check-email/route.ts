import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")?.trim()

  if (!email) {
    return NextResponse.json(
      {
        available: false,
        message: "Email is required",
      },
      { status: 400 },
    )
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      {
        available: false,
        message: "Invalid email format",
      },
      { status: 400 },
    )
  }

  try {
    const client = await clientPromise
    const db = client.db("atm_database")

    const existingUser = await db.collection("users").findOne({ email })

    return NextResponse.json(
      {
        available: !existingUser,
        message: existingUser ? "Email already registered" : "Email available",
      },
      {
        headers: {
          "Content-Security-Policy": "default-src 'self'",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        },
      },
    )
  } catch (error) {
    console.error("Error checking email availability:", error)
    return NextResponse.json(
      {
        error: "Failed to check email availability",
      },
      { status: 500 },
    )
  }
}

