"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { SessionTimeout } from "@/components/session-timeout"
import { getToken, clearToken } from "@/lib/auth"

// Títulos únicos por ruta (WCAG 2.4.2). Las páginas son "use client" y no pueden
// exportar metadata, así que se setea document.title de forma centralizada.
const PAGE_TITLES = {
  "/dashboard": "Inicio",
  "/emergency": "Números de emergencia",
  "/information": "Información",
  "/survey": "Encuesta",
  "/responses": "Respuestas",
  "/institutions": "Instituciones",
  "/institutional-allies": "Aliados institucionales",
  "/support-institutions": "Instituciones de apoyo",
  "/states": "Estados",
  "/whatsapp": "WhatsApp",
}

export default function PrivateLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      clearToken()
      router.replace("/") // respaldo: el middleware ya protege en el servidor
      return
    }
    setReady(true)
  }, [router])

  // Título de página + mover el foco al contenido al cambiar de vista (SPA, WCAG 2.4.3).
  useEffect(() => {
    if (!ready) return
    const title = PAGE_TITLES[pathname] || "Dashboard"
    document.title = `${title} · App Morada`
    mainRef.current?.focus()
  }, [pathname, ready])

  if (!ready) return null

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <AppSidebar />
      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 overflow-auto outline-none">
        {/* Barra superior solo en móvil: única forma de abrir el menú lateral (Sheet). */}
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background px-4 py-2.5 md:hidden">
          <SidebarTrigger className="text-foreground" />
          <span className="font-semibold">{PAGE_TITLES[pathname] || "App Morada"}</span>
          <ThemeToggle className="ml-auto" />
        </header>
        {children}
      </main>
      <SessionTimeout />
      <Toaster />
    </>
  )
}
