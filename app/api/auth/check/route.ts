import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db("atm_database")

    const user = await db.collection("users").findOne({ username: userSession.value })

    if (user) {
      return NextResponse.json({
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
      })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error checking authentication:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

