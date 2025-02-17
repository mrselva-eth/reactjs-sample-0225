"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTaskDialog } from "./create-task-dialog"
import { TaskList } from "./task-list"
import type { Task } from "@/types/task"
import { updateTaskStatus, getUserTasks, storeTasks } from "@/lib/tasks"
import { useToast } from "@/components/ui/use-toast"

export interface Notification {
  id: string
  message: string
  timestamp: number
}

interface TaskManagerProps {
  identifier: string
  searchQuery: string
}

export function TaskManager({ identifier, searchQuery }: TaskManagerProps) {
  const [personalTasks, setPersonalTasks] = useState<Task[]>([])
  const [companyTasks, setCompanyTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"personal" | "company">("personal")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const checkNotifications = useCallback(
    (tasks: Task[]) => {
      const now = new Date().getTime()
      const newNotifications: Notification[] = []
      const existingNotificationIds = new Set(notifications.map((n) => n.id))

      tasks.forEach((task) => {
        const dueTime = new Date(task.dueDate).getTime()
        const timeDiff = dueTime - now

        // 24-hour notification
        if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 23 * 60 * 60 * 1000) {
          const notificationId = `${task.id}-24h`
          if (!existingNotificationIds.has(notificationId)) {
            newNotifications.push({
              id: notificationId,
              message: `Task "${task.title}" will end in 24 hours`,
              timestamp: now,
            })
          }
        }

        // 1-hour notification
        if (timeDiff > 0 && timeDiff <= 60 * 60 * 1000) {
          const notificationId = `${task.id}-1h`
          if (!existingNotificationIds.has(notificationId)) {
            newNotifications.push({
              id: notificationId,
              message: `Task "${task.title}" will end in 1 hour`,
              timestamp: now,
            })
          }
        }
      })

      if (newNotifications.length > 0) {
        setNotifications((prevNotifications) => [...prevNotifications, ...newNotifications])

        // Play sound only once for new notifications
        if (audio) {
          audio.play().catch((error) => console.error("Error playing notification sound:", error))
        }
      }
    },
    [notifications, audio],
  )

  useEffect(() => {
    loadTasks()
    const interval = setInterval(() => loadTasks(), 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const personalMatch = personalTasks.some((task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
      const companyMatch = companyTasks.some((task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()))

      if (companyMatch && !personalMatch) {
        setActiveTab("company")
      } else if (personalMatch) {
        setActiveTab("personal")
      }
    }
  }, [searchQuery, personalTasks, companyTasks])

  const removeExpiredNotifications = useCallback(() => {
    const now = new Date().getTime()
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => {
        const [taskId, type] = notification.id.split("-")
        const task = [...personalTasks, ...companyTasks].find((t) => t.id === taskId)
        if (!task) return false // Remove if task no longer exists

        const dueTime = new Date(task.dueDate).getTime()
        if (type === "24h") {
          return dueTime - now > 23 * 60 * 60 * 1000 // Keep if still more than 23 hours away
        } else if (type === "1h") {
          return dueTime - now > 0 // Keep if not yet due
        }
        return false
      }),
    )
  }, [personalTasks, companyTasks])

  const loadTasks = async () => {
    try {
      const { personalTasks, companyTasks } = await getUserTasks(identifier)
      const updatedPersonalTasks = personalTasks.map(updateTaskStatus)
      const updatedCompanyTasks = companyTasks.map(updateTaskStatus)
      setPersonalTasks(updatedPersonalTasks)
      setCompanyTasks(updatedCompanyTasks)
      checkNotifications([...updatedPersonalTasks, ...updatedCompanyTasks])
      removeExpiredNotifications()
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (taskData: Task) => {
    try {
      const newTasks = taskData.category === "personal" ? [...personalTasks, taskData] : [...companyTasks, taskData]

      await storeTasks(
        identifier,
        taskData.category === "personal" ? newTasks : personalTasks,
        taskData.category === "company" ? newTasks : companyTasks,
      )

      if (taskData.category === "personal") {
        setPersonalTasks(newTasks)
      } else {
        setCompanyTasks(newTasks)
      }

      checkNotifications([...personalTasks, ...companyTasks, taskData])
      toast({
        title: "Success",
        description: "Task created successfully",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const newPersonalTasks =
        updatedTask.category === "personal"
          ? personalTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
          : personalTasks

      const newCompanyTasks =
        updatedTask.category === "company"
          ? companyTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
          : companyTasks

      await storeTasks(identifier, newPersonalTasks, newCompanyTasks)
      setPersonalTasks(newPersonalTasks)
      setCompanyTasks(newCompanyTasks)
      checkNotifications([...newPersonalTasks, ...newCompanyTasks])
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const newAudio = new Audio("/ATM.mp3")
    newAudio.volume = 1.0 // Ensure full volume
    setAudio(newAudio)
    return () => {
      if (newAudio) {
        newAudio.pause()
        newAudio.currentTime = 0 // Reset audio to beginning
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F6AD37]"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col pt-6">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">My Tasks</h2>
          <CreateTaskDialog onTaskCreate={handleCreateTask} />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "personal" | "company")}
          className="flex flex-col h-[calc(100vh-180px)]"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="personal">Personal Tasks</TabsTrigger>
            <TabsTrigger value="company">Company Tasks</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="personal" className="h-full overflow-y-auto mt-0 border-0">
              <TaskList
                tasks={personalTasks}
                category="personal"
                searchQuery={searchQuery}
                onTaskUpdate={handleUpdateTask}
              />
            </TabsContent>
            <TabsContent value="company" className="h-full overflow-y-auto mt-0 border-0">
              <TaskList
                tasks={companyTasks}
                category="company"
                searchQuery={searchQuery}
                onTaskUpdate={handleUpdateTask}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

