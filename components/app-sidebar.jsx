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
} from "@/components/ui/sidebar"
import { Phone, FileText, HelpCircle, Building, MessageCircle, Heart, Users, MapPin, Shield, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"


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
  /*{
    title: "Estados",
    url: "/states",
    icon: MapPin,
  },*/
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
  /*{
    title: "Instituciones de Apoyo",
    url: "/support-institutions",
    icon: Heart,
  },
  {
    title: "Aliados Institucionales",
    url: "/institutional-allies",
    icon: Users,
  },*/
]

export function AppSidebar() {

  const router = useRouter()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Dashboard Admin</h2>
          <p className="text-sm text-muted-foreground">App de Apoyo</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión de Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      sessionStorage.removeItem("token")
                      router.push("/")
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
