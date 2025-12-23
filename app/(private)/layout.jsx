"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function PrivateLayout({ children }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      sessionStorage.removeItem("token")
      router.replace("/admin") // redirige al login si no hay token
      return
    }
    setReady(true)
  }, [router])

  if (!ready) return null

  return (
    <>
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster />
    </>
  )
}