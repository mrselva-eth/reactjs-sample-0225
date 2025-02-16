import type { Task } from "@/types/task"
import axios from "axios"
import { getUserData } from "./ipfs"

const axiosInstance = axios.create()
axiosInstance.interceptors.response.use(undefined, async (error) => {
  if (error.response && error.response.status === 429) {
    // Wait for 1 second before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return axiosInstance.request(error.config)
  }
  return Promise.reject(error)
})

export async function storeTasks(identifier: string, tasks: Task[]): Promise<string> {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`

  const userData = await getUserData(identifier)
  if (!userData) {
    throw new Error("User not found")
  }

  const data = JSON.stringify({
    pinataMetadata: {
      name: `tasks_${userData.username}.json`,
      keyvalues: {
        username: userData.username,
        type: "user_tasks",
      },
    },
    pinataContent: tasks,
  })

  try {
    const response = await axiosInstance.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
      },
    })

    return response.data.IpfsHash
  } catch (error) {
    console.error("Error storing tasks on IPFS:", error)
    throw new Error("Failed to store tasks on IPFS")
  }
}

export async function getUserTasks(identifier: string): Promise<Task[]> {
  try {
    const userData = await getUserData(identifier)
    if (!userData) {
      throw new Error("User not found")
    }

    // Search for user's tasks file
    const url = `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"username":{"value":"${userData.username}","op":"eq"},"type":{"value":"user_tasks","op":"eq"}}`
    const response = await axiosInstance.get(url, {
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
      },
    })

    if (response.data.rows.length === 0) {
      return []
    }

    // Get the most recent tasks file
    const mostRecent = response.data.rows[0]
    const tasksResponse = await axiosInstance.get(`https://gateway.pinata.cloud/ipfs/${mostRecent.ipfs_pin_hash}`)
    return tasksResponse.data
  } catch (error) {
    console.error("Error fetching tasks from IPFS:", error)
    return []
  }
}

export function updateTaskStatus(task: Task): Task {
  const now = new Date()
  const dueDate = new Date(task.dueDate)

  // If the task is already completed, don't change its status
  if (task.status === "completed") {
    return task
  }

  // If due date has passed and task isn't completed
  if (dueDate < now) {
    return { ...task, status: "pending" }
  }

  // If due date is in the future and task has started
  if (task.status === "in-progress") {
    return task
  }

  // Default to in-progress for new tasks
  return { ...task, status: "in-progress" }
}

