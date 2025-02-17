import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")?.trim()

  if (!username) {
    return NextResponse.json(
      {
        available: false,
        message: "Username is required",
      },
      { status: 400 },
    )
  }

  // Username validation
  if (username.length < 3) {
    return NextResponse.json(
      {
        available: false,
        message: "Username must be at least 3 characters long",
      },
      { status: 400 },
    )
  }

  try {
    const client = await clientPromise
    const db = client.db("atm_database")

    const existingUser = await db.collection("users").findOne({ username })

    return NextResponse.json(
      {
        available: !existingUser,
        message: existingUser ? "Username already taken" : "Username available",
      },
      {
        headers: {
          "Content-Security-Policy": "default-src 'self'",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        },
      },
    )
  } catch (error) {
    console.error("Error checking username availability:", error)
    return NextResponse.json(
      {
        error: "Failed to check username availability",
      },
      { status: 500 },
    )
  }
}

