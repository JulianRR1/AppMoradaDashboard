import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, FileText, HelpCircle, Building, MessageCircle, Shield } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {

  const dashboardCards = [
    {
      title: "Números de Emergencia",
      description: "Gestiona los números de emergencia por estado y municipio",
      icon: Phone,
      url: "/emergency",
    },
    {
      title: "Cards Informativas",
      description: "Administra el contenido informativo de la app",
      icon: FileText,
      url: "/information",
    },
    {
      title: "Test de Preguntas",
      description: "Configura las preguntas del test de evaluación",
      icon: HelpCircle,
      url: "/survey",
    },
    {
      title: "Respuestas",
      description: "Gestiona las respuestas configuradas según puntaje del test",
      icon: Shield,
      url: "/responses",
    },
    {
      title: "Instituciones",
      description: "Administra las instituciones disponibles",
      icon: Building,
      url: "/institutions",
    },
    {
      title: "Línea WhatsApp",
      description: "Gestiona los numeros de Whatsapp para apoyo LSM",
      icon: MessageCircle,
      url: "/whatsapp",
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
          <p className="text-muted-foreground">Gestiona el contenido de la app móvil de apoyo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((item) => (
          <Link href={item.url} key={item.title} className="block group">
            <Card className="h-full cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <item.icon className="w-8 h-8 text-primary transition-colors group-hover:text-sidebar-primary" strokeWidth={2.5} />
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
