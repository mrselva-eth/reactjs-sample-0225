"use client"

import type React from "react"
import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { TaskCategory } from "@/types/task"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface CreateTaskDialogProps {
  onTaskCreate: (taskData: any) => void
}

export function CreateTaskDialog({ onTaskCreate }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState<TaskCategory>("personal")
  const [dateTime, setDateTime] = useState<Date | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    projectName: "",
    department: "",
    assignedBy: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taskData = {
      ...formData,
      category,
      dueDate: dateTime?.toISOString() || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: "in-progress",
      id: crypto.randomUUID(),
    }
    onTaskCreate(taskData)
    setIsOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      projectName: "",
      department: "",
      assignedBy: "",
    })
    setDateTime(null)
    setCategory("personal")
  }

  return (
    <>
      <Button
        size="icon"
        className="bg-[#F6AD37] hover:bg-[#F6AD37]/90 text-white rounded-full h-12 w-12"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Task">
        <div className="sm:max-w-[600px] p-0 h-[80vh] max-h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b">
            <div>
              <div className="text-lg font-semibold">Create New Task</div>
            </div>
            <Tabs value={category} onValueChange={(value) => setCategory(value as TaskCategory)} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
            <div className="flex-grow overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Name</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date and Time</Label>
                  <DatePicker
                    selected={dateTime}
                    onChange={(date: Date) => setDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholderText="Select date and time"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8],
                        },
                      },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: string) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {category === "company" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedBy">Assigned By</Label>
                      <Input
                        id="assignedBy"
                        value={formData.assignedBy}
                        onChange={(e) => setFormData({ ...formData, assignedBy: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t p-4 mt-auto">
              <Button type="submit" className="w-full bg-[#F6AD37] hover:bg-[#F6AD37]/90 text-white">
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

