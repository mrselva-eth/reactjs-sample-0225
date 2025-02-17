import { cookies } from "next/headers"
import { Dashboard } from "@/components/dashboard/dashboard"
import { redirect } from "next/navigation"
import TaskManagerContent from "@/app/task-manager/task-manager-content"
import { getProfileImage } from "@/lib/profile"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    redirect("/auth")
  }

  const profileImage = await getProfileImage()

  return (
    <TaskManagerContent profileImage={profileImage}>
      <div className="container mx-auto px-4 py-8">
        <Dashboard identifier={userSession.value} />
      </div>
    </TaskManagerContent>
  )
}

