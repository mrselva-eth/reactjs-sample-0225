export interface User {
  id: string
  username: string
  email?: string
  walletAddress?: string
  profileImage: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string
  assignedTo?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Board {
  id: string
  name: string
  tasks: Task[]
  members: User[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

