export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  createdAt: string
  category: "personal" | "company"
  status: "pending" | "in-progress" | "completed"
  priority?: "low" | "medium" | "high"
  // Additional fields for company tasks
  projectName?: string
  assignedBy?: string
  department?: string
}

export type TaskCategory = "personal" | "company"

