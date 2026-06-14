"use client"

import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Phone, FileText, HelpCircle, Building, MessageCircle, MapPin, Shield, Home, LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { clearToken, getUserEmail } from "@/lib/auth"

// Mismos enlaces de siempre, organizados en secciones para mejor escaneabilidad.
const menuSections = [
  {
    label: "Principal",
    items: [{ title: "Inicio", url: "/dashboard", icon: Home }],
  },
  {
    label: "Contenido",
    items: [
      { title: "Cards Informativas", url: "/information", icon: FileText },
      { title: "Instituciones", url: "/institutions", icon: Building },
      { title: "Números de Emergencia", url: "/emergency", icon: Phone },
    ],
  },
  {
    label: "Evaluación",
    items: [
      { title: "Test de Preguntas", url: "/survey", icon: HelpCircle },
      { title: "Respuestas del Test", url: "/responses", icon: Shield },
    ],
  },
  {
    label: "Contacto",
    items: [{ title: "Línea WhatsApp", url: "/whatsapp", icon: MessageCircle }],
  },
]

// Clases del item activo: pill morado sólido (contraste verificado WCAG AA).
const ACTIVE_CLASSES =
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground " +
  "data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground " +
  "data-[active=true]:font-medium"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const [email, setEmail] = useState("")

  // En móvil, cerrar el cajón al navegar a otra sección.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  useEffect(() => {
    setEmail(getUserEmail() || "")
  }, [])

  const initials = (email ? email.split("@")[0] : "")
    .split(/[.\-_]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <SidebarTrigger className="text-sidebar-foreground" />
          <Link
            href="/dashboard"
            onClick={closeOnMobile}
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
            aria-label="App Morada, ir al inicio"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <MapPin className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">App Morada</span>
              <span className="text-xs text-sidebar-foreground/70">Panel de administración</span>
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Menú principal">
          {menuSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="text-sidebar-primary font-medium">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive = pathname === item.url
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                          className={ACTIVE_CLASSES}
                        >
                          <Link href={item.url} onClick={closeOnMobile} aria-current={isActive ? "page" : undefined}>
                            <item.icon className="!w-5 !h-5" strokeWidth={2.25} aria-hidden="true" />
                            <span className="font-medium group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-medium">Administrador</span>
            <span className="truncate text-xs text-sidebar-foreground/70">{email || "—"}</span>
          </span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={() => {
                clearToken()
                router.push("/")
              }}
              className="text-sidebar-foreground hover:bg-red-100 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <LogOut className="!w-5 !h-5" strokeWidth={2.25} aria-hidden="true" />
              <span className="font-medium group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
