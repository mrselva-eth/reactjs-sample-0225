import { getProfileImage } from "@/lib/profile"
import TaskManagerContent from "./task-manager-content"
import { TaskManager } from "@/components/tasks/task-manager"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function TaskManagerPage() {
  const profileImage = await getProfileImage()
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    redirect("/auth")
  }

  return (
    <TaskManagerContent profileImage={profileImage}>
      <TaskManager identifier={userSession.value} searchQuery="" />
    </TaskManagerContent>
  )
}

