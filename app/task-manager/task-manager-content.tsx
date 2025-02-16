"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import "./styles.css"
import { TaskManager } from "@/components/tasks/task-manager"

interface ProfileImage {
  id: string
  author: string
  url: string
}

const formatWalletAddress = (address: string) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface TaskManagerContentProps {
  profileImage: ProfileImage
  children?: React.ReactNode
}

export default function TaskManagerContent({ profileImage, children }: TaskManagerContentProps) {
  const [user, setUser] = useState<{ username: string; email?: string; walletAddress?: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/check")
      if (res.ok) {
        const data = await res.json()
        setUser({
          username: data.username,
          email: data.email,
          walletAddress: data.walletAddress,
        })
      } else {
        router.push("/auth")
      }
    }

    checkAuth()

    // Initialize audio element
    audioRef.current = new Audio("/ATM.mp3")
  }, [router])

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" })
    if (res.ok) {
      router.push("/auth")
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F6AD37]"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="bg-[#1A1C1E] shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <div className="flex items-center w-full md:w-auto justify-between md:justify-start mb-4 md:mb-0">
              <Link
                href="/task-manager"
                className="group relative flex items-center gap-4 text-[#F6AD37] hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <Image src="/ATM.png" alt="ATM Logo" width={48} height={48} className="object-contain" />
                  <span className="text-3xl font-bold tracking-tight">ATM</span>
                </div>
                <span className="absolute left-0 top-[calc(100%+0.5rem)] hidden group-hover:block text-sm font-medium bg-[#2B2D31] text-white/90 px-3 py-1.5 rounded-md transform border border-white/10 whitespace-nowrap z-50 shadow-lg">
                  Arakoo Task Manager
                </span>
              </Link>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                className="text-gray-200 hover:text-white hover:bg-transparent nav-link"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="text-gray-200 hover:text-white hover:bg-transparent nav-link"
                onClick={() => router.push("/task-manager")}
              >
                Tasks
              </Button>
            </nav>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full md:w-64 bg-[#2B2D31] border-none text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F6AD37]/50 rounded-full"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 relative rounded-full">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
                    <Avatar className="h-12 w-12 transition-transform hover:scale-105 border-2 border-white">
                      <AvatarImage src={profileImage.url} alt={`Profile picture by ${profileImage.author}`} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      {user.walletAddress ? (
                        <p className="text-xs leading-none text-muted-foreground font-mono tracking-tight">
                          {formatWalletAddress(user.walletAddress)}
                        </p>
                      ) : user.email ? (
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      ) : null}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 overflow-hidden">
        {children || (
          <TaskManager identifier={user.walletAddress || user.email || user.username} searchQuery={searchQuery} />
        )}
      </main>
    </div>
  )
}

