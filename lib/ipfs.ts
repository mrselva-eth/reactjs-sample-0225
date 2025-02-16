import axios, { type AxiosRequestConfig, type AxiosInstance } from "axios"
import crypto from "crypto"

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  retry?: number
  retryDelay?: number
  retryCount?: number
}

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create()

  instance.interceptors.response.use(undefined, async (error) => {
    const config = error.config as CustomAxiosRequestConfig
    if (!config || !config.retry) {
      return Promise.reject(error)
    }

    config.retryCount = config.retryCount ?? 0

    if (config.retryCount >= (config.retry ?? 0)) {
      return Promise.reject(error)
    }

    config.retryCount += 1

    const delayMs = config.retryDelay || 1000
    await new Promise((resolve) => setTimeout(resolve, delayMs * 2 ** ((config.retryCount ?? 1) - 1)))

    return instance(config)
  })

  return instance
}

const axiosInstance = createAxiosInstance()

interface PinataFile {
  ipfs_pin_hash: string
  size: number
  date_pinned: string
}

export interface UserData {
  username: string
  email?: string
  password?: string // Will be hashed before storage
  walletAddress?: string
  createdAt: string
}

export async function storeUserData(userData: UserData): Promise<string> {
  // First, check if username or email/wallet already exists
  const existingUser = await checkExistingUser(userData.username, userData.email, userData.walletAddress)
  if (existingUser) {
    throw new Error(existingUser.error)
  }

  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`

  // Hash the password before storing, if it exists
  const dataToStore: UserData = {
    ...userData,
    password: userData.password ? await hashPassword(userData.password) : undefined,
    createdAt: new Date().toISOString(),
  }

  // Add metadata to help with searching
  const data = JSON.stringify({
    pinataMetadata: {
      name: `user_${userData.username}.json`,
      keyvalues: {
        username: userData.username,
        email: userData.email,
        walletAddress: userData.walletAddress,
        type: "user_data",
      },
    },
    pinataContent: dataToStore,
  })

  try {
    const response = await axiosInstance.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
      },
      retry: 3,
      retryDelay: 1000,
    } as CustomAxiosRequestConfig)

    return response.data.IpfsHash
  } catch (error) {
    console.error("Error storing data on IPFS:", error)
    throw new Error("Failed to store user data on IPFS")
  }
}

async function checkExistingUser(
  username: string,
  email?: string,
  walletAddress?: string,
): Promise<{ error: string } | null> {
  try {
    // Check all user data files
    const url = `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"type":{"value":"user_data","op":"eq"}}`
    const response = await axiosInstance.get(url, {
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
      },
      retry: 3,
      retryDelay: 1000,
    } as CustomAxiosRequestConfig)

    // Fetch and check each file's content
    for (const file of response.data.rows) {
      const userData = await fetchIPFSData(file.ipfs_pin_hash)
      if (userData.username === username) {
        return { error: "Username already taken" }
      }
      if (email && userData.email === email) {
        return { error: "Email already registered" }
      }
      if (walletAddress && userData.walletAddress === walletAddress) {
        return { error: "Wallet address already registered" }
      }
    }

    return null
  } catch (error) {
    console.error("Error checking existing user:", error)
    return null
  }
}

async function fetchIPFSData(hash: string): Promise<UserData> {
  try {
    const response = await axiosInstance.get(`https://gateway.pinata.cloud/ipfs/${hash}`, {
      retry: 3,
      retryDelay: 1000,
    } as CustomAxiosRequestConfig)
    return response.data
  } catch (error) {
    console.error("Error fetching IPFS data:", error)
    throw new Error("Failed to fetch user data")
  }
}

export async function getUserData(identifier: string): Promise<UserData | null> {
  try {
    // Search by username, email, and wallet address
    const url = `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"type":{"value":"user_data","op":"eq"}}`
    const response = await axiosInstance.get(url, {
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
      },
      retry: 3,
      retryDelay: 1000,
    } as CustomAxiosRequestConfig)

    // Check each file's content for matching username, email, or wallet address
    for (const file of response.data.rows) {
      try {
        const userData = await fetchIPFSData(file.ipfs_pin_hash)
        if (
          userData.username === identifier ||
          userData.email === identifier ||
          userData.walletAddress === identifier
        ) {
          return userData
        }
      } catch (error) {
        console.error(`Error fetching IPFS data for hash ${file.ipfs_pin_hash}:`, error)
        // Continue to the next file if there's an error
        continue
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching user data from IPFS:", error)
    return null
  }
}

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex")
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      resolve(salt + ":" + derivedKey.toString("hex"))
    })
  })
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashedPassword.split(":")
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      resolve(key === derivedKey.toString("hex"))
    })
  })
}

