"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { setToken, getTokenExp } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

// Aviso de expiración de sesión (WCAG 2.2.1 — Tiempo ajustable).
// Muestra un diálogo WARN_BEFORE ms antes de que expire el JWT y permite
// extender la sesión llamando al endpoint de refresh del backend.
const WARN_BEFORE = 2 * 60 * 1000 // 2 minutos antes de expirar

export function SessionTimeout() {
  const [open, setOpen] = useState(false)
  const [extending, setExtending] = useState(false)
  const [error, setError] = useState(false)
  const warnTimer = useRef(null)
  const { toast } = useToast()

  const scheduleWarning = () => {
    if (warnTimer.current) clearTimeout(warnTimer.current)
    const exp = getTokenExp()
    if (!exp) return
    const msUntilWarn = exp - Date.now() - WARN_BEFORE
    // Si ya estamos dentro de la ventana de aviso, mostrar de inmediato.
    warnTimer.current = setTimeout(() => setOpen(true), Math.max(0, msUntilWarn))
  }

  useEffect(() => {
    scheduleWarning()
    return () => warnTimer.current && clearTimeout(warnTimer.current)
  }, [])

  const handleExtend = async () => {
    setExtending(true)
    setError(false)
    try {
      const { data } = await api.post("auth/refresh")
      if (!data?.token) throw new Error("Respuesta sin token")
      setToken(data.token)
      setOpen(false)
      scheduleWarning() // reprograma el siguiente aviso con el nuevo exp
      toast({ title: "Sesión extendida", description: "Tu sesión se renovó correctamente." })
    } catch {
      // Feedback visible: no fallar en silencio.
      setError(true)
      toast({
        title: "No se pudo extender la sesión",
        description: "Inténtalo de nuevo. Si el problema persiste, vuelve a iniciar sesión.",
        variant: "destructive",
      })
    } finally {
      setExtending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tu sesión está por expirar</DialogTitle>
          <DialogDescription>
            Por seguridad, tu sesión se cerrará pronto. Extiéndela para no perder tu trabajo.
            Tus cambios sin guardar se conservan y se restaurarán si vuelves a iniciar sesión.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            No se pudo extender la sesión. Inténtalo de nuevo.
          </p>
        )}
        <DialogFooter>
          <Button onClick={handleExtend} disabled={extending}>
            {extending ? "Extendiendo…" : "Extender sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
