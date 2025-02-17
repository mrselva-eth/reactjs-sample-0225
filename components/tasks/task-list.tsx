"use client"

import { useEffect, useRef, useState } from "react"
import type { Task } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Calendar, Clock, Pencil } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EditTaskDialog } from "./edit-task-dialog"

interface TaskListProps {
  tasks: Task[]
  category: "personal" | "company"
  searchQuery: string
  onTaskUpdate: (updatedTask: Task) => Promise<void>
}

export function TaskList({ tasks, category, searchQuery, onTaskUpdate }: TaskListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const filteredTasks = tasks.filter((task) => task.category === category)

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        const matchingTasks = filteredTasks.filter((task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )

        if (matchingTasks.length > 0 && listRef.current) {
          const firstMatch = document.getElementById(`task-${matchingTasks[0].id}`)
          if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [searchQuery, filteredTasks])

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      case "pending":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const highlightSearchText = (text: string) => {
    if (!searchQuery) return text

    const regex = new RegExp(`(${searchQuery})`, "gi")
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </>
    )
  }

  return (
    <>
      <div className="space-y-4 pr-2" ref={listRef}>
        {filteredTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery
              ? `No ${category} tasks found matching "${searchQuery}"`
              : `No ${category} tasks found. Create one to get started!`}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              id={`task-${task.id}`}
              className={cn(
                "hover:shadow-md transition-shadow",
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery
                  ? "ring-2 ring-[#F6AD37] shadow-lg transform scale-[1.02] transition-all"
                  : "",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{highlightSearchText(task.title)}</h3>
                      {category === "company" && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    {category === "company" && task.projectName && (
                      <p className="text-sm">
                        <span className="font-medium">Project:</span> {task.projectName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTask(task)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className={cn(getStatusColor(task.status))}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(task.dueDate), "PPP")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(task.dueDate), "p")}
                    </div>
                  </div>
                  {category === "company" && task.assignedBy && <div>Assigned by: {task.assignedBy}</div>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {editingTask && (
        <EditTaskDialog task={editingTask} isOpen={true} onClose={() => setEditingTask(null)} onSave={onTaskUpdate} />
      )}
    </>
  )
}

