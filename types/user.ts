export interface UserData {
  username: string
  email?: string
  password?: string // Will be hashed before storage
  walletAddress?: string
  createdAt: string
}

