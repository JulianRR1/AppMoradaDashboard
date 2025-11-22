import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"


export default function RootLayout({ children }) {


  return (
    <html lang="es">
      <body>
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
