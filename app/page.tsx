import Image from "next/image"
import { redirect } from "next/navigation"

export default function Home() {
  // TODO: Check if user is authenticated
  // For now, redirect to auth page
  redirect("/auth")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to ATM - Arakoo Task Manager
        </p>
      </div>

      <div className="relative flex place-items-center my-16">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src="/ATM.png"
          alt="ATM Logo"
          width={300}
          height={300}
          priority
        />
      </div>

      {/* Rest of the component remains the same */}
    </main>
  )
}

