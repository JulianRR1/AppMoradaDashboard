"use client"

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
} from "@/components/ui/sidebar"
import { Phone, FileText, HelpCircle, Building, MessageCircle, MapPin, Shield, Home } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOut } from "lucide-react"



const menuItems = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Números de Emergencia",
    url: "/emergency",
    icon: Phone,
  },
  {
    title: "Cards Informativas",
    url: "/information",
    icon: FileText,
  },
  {
    title: "Test de Preguntas",
    url: "/survey",
    icon: HelpCircle,
  },
  {
    title: "Respuestas del Test",
    url: "/responses",
    icon: Shield,
  },
  {
    title: "Instituciones",
    url: "/institutions",
    icon: Building,
  },
  {
    title: "Línea WhatsApp",
    url: "/whatsapp",
    icon: MessageCircle,
  },
]

export function AppSidebar() {

  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">

      <SidebarHeader className="flex flex-col items-center justify-center py-4 relative transition-all">
        <SidebarTrigger className="absolute left-2 top-4 text-sidebar-foreground transition-all group-data-[collapsible=icon]:relative group-data-[collapsible=icon]:left-0 group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:mb-2" />
        <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-full w-12 h-12 flex items-center justify-center mt-8 group-data-[collapsible=icon]:mt-0 transition-all">
          <MapPin className="!w-6 !h-6" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold mt-2 group-data-[collapsible=icon]:hidden">App Morada</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión de Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className="hover:translate-x-1 transition-transform duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon
                        className={`!w-6 !h-6 ${pathname === item.url ? "text-sidebar-primary" : ""}`}
                        strokeWidth={2.5}
                      />
                      <span className="text-base font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuButton
            tooltip="Cerrar sesión"
            onClick={() => {
              sessionStorage.removeItem("token")
              router.push("/")
            }}
            className="w-full justify-start hover:translate-x-1 transition-transform duration-200"
          >
            <LogOut className="!w-6 !h-6" strokeWidth={2.5} />
            <span className="text-base font-medium group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
