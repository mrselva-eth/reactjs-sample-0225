import { NextResponse } from "next/server"
import { storeUserData } from "@/lib/ipfs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { username, address } = await req.json()

    if (!username || !address) {
      return NextResponse.json({ error: "Username and wallet address are required" }, { status: 400 })
    }

    try {
      await storeUserData({ username, walletAddress: address, createdAt: new Date().toISOString() })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_session", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      success: true,
      message: "Wallet account created successfully!",
    })
  } catch (error) {
    console.error("Wallet signup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Wallet signup failed",
      },
      { status: 500 },
    )
  }
}

