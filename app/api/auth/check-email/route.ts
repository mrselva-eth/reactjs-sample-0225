import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")?.trim().toLowerCase() // Add toLowerCase() for case-insensitive comparison

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

    // Case-insensitive email search
    const existingUser = await db.collection("users").findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    })

    // Add debug logging
    console.log("Checking email availability:", {
      searchEmail: email,
      exists: !!existingUser,
      existingEmail: existingUser?.email,
    })

    return NextResponse.json(
      {
        available: !existingUser,
        message: existingUser ? "Email already registered" : "Email available",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
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

