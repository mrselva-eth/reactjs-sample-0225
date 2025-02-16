import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserData } from "@/lib/ipfs"

export async function GET() {
  const cookieStore = cookies()
  const userSession = cookieStore.get("user_session")

  if (userSession) {
    const userData = await getUserData(userSession.value)
    if (userData) {
      return NextResponse.json({
        username: userSession.value,
        email: userData.email,
        walletAddress: userData.walletAddress, // Added wallet address to response
      })
    }
  }

  return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
}

