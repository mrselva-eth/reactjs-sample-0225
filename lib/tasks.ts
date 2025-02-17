import type { Task } from "@/types/task"

export async function storeTasks(identifier: string, personalTasks: Task[], companyTasks: Task[]): Promise<void> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ personalTasks, companyTasks }),
  })

  if (!response.ok) {
    throw new Error("Failed to store tasks")
  }
}

export async function getUserTasks(identifier: string): Promise<{ personalTasks: Task[]; companyTasks: Task[] }> {
  const response = await fetch("/api/tasks")
  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
  }
  return response.json()
}

export function updateTaskStatus(task: Task): Task {
  const now = new Date()
  const dueDate = new Date(task.dueDate)

  if (task.status === "completed") {
    return task
  }

  if (dueDate < now) {
    return { ...task, status: "pending" }
  }

  if (task.status === "in-progress") {
    return task
  }

  return { ...task, status: "in-progress" }
}

