import { NextResponse } from "next/server"

// Rutas privadas que viven dentro del route group (private).
// El paréntesis NO aparece en la URL, por eso listamos las rutas reales.
const PRIVATE_PATHS = [
  "/dashboard",
  "/emergency",
  "/information",
  "/institutional-allies",
  "/institutions",
  "/responses",
  "/states",
  "/support-institutions",
  "/survey",
  "/whatsapp",
]

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  const isPrivate = PRIVATE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  // Sin token intentando entrar a zona privada -> al login.
  if (isPrivate && !token) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Con token y parado en el login -> directo al dashboard.
  if (pathname === "/" && token) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Ejecuta el middleware en todas las rutas salvo assets internos de Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
