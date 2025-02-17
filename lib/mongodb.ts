declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (typeof global._mongoClientPromise === "undefined") {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export interface UserDocument {
  username: string
  email: string
  password: string
  method: string
  createdAt: Date
  personalTasks: Array<Task>
  companyTasks: Array<Task>
}

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  createdAt: string
  category: "personal" | "company"
  projectName?: string
  assignedBy?: string
  department?: string
}

