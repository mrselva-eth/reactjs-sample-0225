"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserTasks } from "@/lib/tasks"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface DashboardProps {
  identifier: string
}

export function Dashboard({ identifier }: DashboardProps) {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  })

  useEffect(() => {
    const fetchTaskStats = async () => {
      const { personalTasks, companyTasks } = await getUserTasks(identifier)
      const allTasks = [...personalTasks, ...companyTasks]
      const stats = allTasks.reduce(
        (acc, task) => {
          acc.total++
          if (task.status === "completed") acc.completed++
          else if (task.status === "pending") acc.pending++
          else if (task.status === "in-progress") acc.inProgress++
          return acc
        },
        { total: 0, completed: 0, pending: 0, inProgress: 0 },
      )
      setTaskStats(stats)
    }

    fetchTaskStats()
  }, [identifier])

  const chartData = [
    { name: "Total", value: taskStats.total, fill: "#4A4A4A" },
    { name: "Completed", value: taskStats.completed, fill: "#4CAF50" },
    { name: "Pending", value: taskStats.pending, fill: "#FFC107" },
    { name: "In Progress", value: taskStats.inProgress, fill: "#F44336" },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

