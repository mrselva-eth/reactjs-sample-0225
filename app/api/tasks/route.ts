import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import clientPromise, { type UserDocument } from "@/lib/mongodb"

export async function GET() {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db("atm_database")
    const user = await db.collection<UserDocument>("users").findOne({ username: userSession.value })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      personalTasks: user.personalTasks || [],
      companyTasks: user.companyTasks || [],
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { personalTasks, companyTasks } = await req.json()
    const client = await clientPromise
    const db = client.db("atm_database")

    await db
      .collection<UserDocument>("users")
      .updateOne({ username: userSession.value }, { $set: { personalTasks, companyTasks } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing tasks:", error)
    return NextResponse.json({ error: "Failed to store tasks" }, { status: 500 })
  }
}

