import { NextResponse } from "next/server"
import { storeUserData, getUserData } from "@/lib/ipfs"
import { Magic } from "@magic-sdk/admin"

if (!process.env.MAGIC_SECRET_KEY) {
  throw new Error("MAGIC_SECRET_KEY is not defined in the environment variables")
}

const magic = new Magic(process.env.MAGIC_SECRET_KEY)

export async function POST(req: Request) {
  try {
    const { username, email, password, captchaToken, didToken } = await req.json()

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

    // Verify Magic DID token
    if (!didToken) {
      console.error("DID token is missing")
      return NextResponse.json({ error: "Authentication token is missing" }, { status: 400 })
    }

    try {
      const metadata = await magic.users.getMetadataByToken(didToken)
      console.log("Magic Metadata:", metadata) // Log the metadata for debugging
      if (metadata.email !== email) {
        return NextResponse.json({ error: "Email verification failed" }, { status: 400 })
      }
    } catch (error) {
      console.error("Magic token verification error:", error)
      return NextResponse.json({ error: "Email verification failed. Please try again." }, { status: 400 })
    }

    try {
      // Check for existing username/email before storing
      const existingUserByUsername = await getUserData(username)
      if (existingUserByUsername) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }

      const existingUserByEmail = await getUserData(email)
      if (existingUserByEmail) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }

      // Store user data in IPFS only after email verification
      const ipfsHash = await storeUserData({ username, email, password, createdAt: new Date().toISOString() })

      return NextResponse.json({
        success: true,
        message: "Signup successful!",
        ipfsHash,
      })
    } catch (error) {
      // Handle specific error messages from storeUserData
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
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

