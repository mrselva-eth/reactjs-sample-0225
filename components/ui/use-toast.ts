import { useState, type ReactNode } from "react"

type ToastProps = {
  title: string
  description: string
  action?: ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, action, variant = "default" }: ToastProps) => {
    setToasts((currentToasts) => [...currentToasts, { title, description, action, variant }])
  }

  return { toast, toasts }
}

