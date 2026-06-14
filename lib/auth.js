// Manejo centralizado del token de autenticación.
// Se guarda en una cookie para que el middleware (que corre en el edge)
// pueda leerla en la request HTTP. NOTA: no es httpOnly porque el backend
// devuelve el token en el body; una cookie httpOnly real requeriría que el
// backend la setee en la respuesta del login.

export const TOKEN_KEY = "token"

// El proyecto usa basePath: '/admin' (ver next.config.mjs).
export const BASE_PATH = "/admin"

// Ruta del login para APIs basePath-aware de Next (router.push, <Link>,
// NextResponse.redirect): Next antepone el basePath automáticamente.
export const LOGIN_PATH = "/"

// Ruta del login para APIs CRUDAS del navegador (window.location), que NO
// conocen el basePath: aquí necesitamos la URL completa con el prefijo.
export const LOGIN_URL = BASE_PATH

const MAX_AGE = 60 * 60 * 24 // 1 día en segundos

export function setToken(token) {
  if (typeof document === "undefined") return
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

export function getToken() {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function clearToken() {
  if (typeof document === "undefined") return
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
}

// Decodifica el payload del JWT (sin librerías: base64url del segundo segmento).
export function getTokenPayload() {
  const token = getToken()
  if (!token) return null
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

// "exp" del JWT en milisegundos (o null).
export function getTokenExp() {
  const data = getTokenPayload()
  return data && typeof data.exp === "number" ? data.exp * 1000 : null
}

// Email del usuario autenticado (o null).
export function getUserEmail() {
  const data = getTokenPayload()
  return data?.email || null
}
