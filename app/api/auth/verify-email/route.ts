import { NextResponse } from "next/server"
import { Magic } from "@magic-sdk/admin"

if (!process.env.MAGIC_SECRET_KEY) {
  throw new Error("MAGIC_SECRET_KEY is not defined in the environment variables")
}

const magic = new Magic(process.env.MAGIC_SECRET_KEY)

export async function POST(req: Request) {
  try {
    const { didToken } = await req.json()

    if (!didToken) {
      return NextResponse.json({ error: "DID token is missing" }, { status: 400 })
    }

    try {
      const metadata = await magic.users.getMetadataByToken(didToken)
      return NextResponse.json({ success: true, email: metadata.email })
    } catch (error) {
      console.error("Magic token verification error:", error)
      return NextResponse.json({ error: "Email verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Email verification failed",
      },
      { status: 500 },
    )
  }
}

