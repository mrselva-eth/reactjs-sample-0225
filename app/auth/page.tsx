import Image from "next/image"
import { Github, Twitter, Linkedin, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper"

export default function AuthPage() {
  const socialLinks = [
    {
      icon: Github,
      href: "#",
      label: "GitHub",
    },
    {
      icon: Twitter,
      href: "#",
      label: "Twitter",
    },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
    },
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
    },
  ]

  return (
    <div className="h-screen container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-[1fr,2fr] lg:px-0">
      <div className="relative hidden h-full flex-col bg-[#F5F5DC]/70 lg:flex dark:border-r overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url("/back.gif")' }} />

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 z-10 bg-[#F6AD37]/85" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#4A4A4A]/10 to-[#4A4A4A]/20" />

        {/* Content */}
        <div className="relative z-30 flex flex-col items-center justify-between h-full p-6">
          <div className="w-full text-center mt-8">
            <h1 className="text-5xl font-bold tracking-tight font-heading text-white mb-2 leading-tight">
              Arakoo Task Manager
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Image src="/ATM.png" alt="ATM Logo" width={200} height={200} className="mb-6" priority />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social) => (
                <Button key={social.label} variant="ghost" size="icon" className="hover:bg-white/10 text-white" asChild>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <social.icon className="h-6 w-6" />
                  </a>
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-white/70">© {new Date().getFullYear()} ATM. All rights reserved.</p>
          </div>
        </div>
      </div>
      <div className="p-4 lg:p-8 flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px] md:w-[400px] lg:w-[450px]">
          <div className="flex flex-col items-center text-center">
            <Image src="/ATM.png" alt="ATM Logo" width={80} height={80} className="mb-6 lg:hidden" />
            <h1 className="text-4xl font-semibold tracking-tight mb-2">Welcome to ATM</h1>
            <p className="text-base text-muted-foreground mb-6">Enter your credentials below to continue</p>
            <AuthFormWrapper />
          </div>
        </div>
      </div>
    </div>
  )
}

