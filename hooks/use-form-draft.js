"use client"

import { useEffect, useRef } from "react"

// Autoguarda el estado de un formulario en sessionStorage y lo restaura al montar.
// Sirve para no perder datos si la sesión expira (WCAG 2.2.1) o ante recargas.
//
// Uso:
//   const { clearDraft } = useFormDraft("emergency", formData, setFormData)
//   // al guardar con éxito: clearDraft()
//
// enabled permite pausar el guardado (p. ej. cuando el modal está cerrado).
export function useFormDraft(key, formData, setFormData, enabled = true) {
  const storageKey = `draft:${key}`
  const restored = useRef(false)

  // Restaurar una sola vez al montar.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    if (typeof window === "undefined") return
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) setFormData((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {
      // borrador corrupto: ignorar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guardar en cada cambio.
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(formData))
    } catch {
      // cuota llena u otro error: ignorar
    }
  }, [formData, enabled, storageKey])

  const clearDraft = () => {
    if (typeof window === "undefined") return
    try {
      sessionStorage.removeItem(storageKey)
    } catch {
      // ignorar
    }
  }

  return { clearDraft }
}
