export interface Task {
    id: string
    title: string
    description?: string
    completed: boolean
    createdAt: string
    dueDate?: string
    hasReminder?: boolean
    listId: string
    userId: string
  }
  
  export interface TaskList {
    id: string
    title: string
    tasks: Task[]
    userId: string
    createdAt: string
  }
  
  export interface User {
    id: string
    username: string
    profileImage: string
  }
  
  