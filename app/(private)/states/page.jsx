"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

const mexicanStates = [
  { id: "aguascalientes", name: "Aguascalientes", active: true },
  { id: "baja-california", name: "Baja California", active: true },
  { id: "baja-california-sur", name: "Baja California Sur", active: false },
  { id: "campeche", name: "Campeche", active: true },
  { id: "chiapas", name: "Chiapas", active: true },
  { id: "chihuahua", name: "Chihuahua", active: false },
  { id: "coahuila", name: "Coahuila", active: true },
  { id: "colima", name: "Colima", active: true },
  { id: "durango", name: "Durango", active: false },
  { id: "guanajuato", name: "Guanajuato", active: true },
  { id: "guerrero", name: "Guerrero", active: true },
  { id: "hidalgo", name: "Hidalgo", active: true },
  { id: "jalisco", name: "Jalisco", active: true },
  { id: "mexico", name: "Estado de México", active: true },
  { id: "michoacan", name: "Michoacán", active: true },
  { id: "morelos", name: "Morelos", active: true },
  { id: "nayarit", name: "Nayarit", active: false },
  { id: "nuevo-leon", name: "Nuevo León", active: true },
  { id: "oaxaca", name: "Oaxaca", active: true },
  { id: "puebla", name: "Puebla", active: true },
  { id: "queretaro", name: "Querétaro", active: true },
  { id: "quintana-roo", name: "Quintana Roo", active: true },
  { id: "san-luis-potosi", name: "San Luis Potosí", active: false },
  { id: "sinaloa", name: "Sinaloa", active: true },
  { id: "sonora", name: "Sonora", active: false },
  { id: "tabasco", name: "Tabasco", active: true },
  { id: "tamaulipas", name: "Tamaulipas", active: false },
  { id: "tlaxcala", name: "Tlaxcala", active: true },
  { id: "veracruz", name: "Veracruz", active: true },
  { id: "yucatan", name: "Yucatán", active: true },
  { id: "zacatecas", name: "Zacatecas", active: false },
  { id: "cdmx", name: "Ciudad de México", active: true },
]

export default function StatesPage() {
  const [states, setStates] = useState(mexicanStates)
  const { toast } = useToast()

  const toggleState = async (stateId, newStatus) => {
    try {
      // Aquí harías la llamada a la API para actualizar el estado
      // const response = await api.patch(`states/${stateId}/`, { active: newStatus })

      setStates(states.map((state) => (state.id === stateId ? { ...state, active: newStatus } : state)))

      const stateName = states.find((s) => s.id === stateId)?.name
      toast({
        title: newStatus ? "Estado Activado" : "Estado Desactivado",
        description: `${stateName} ha sido ${newStatus ? "activado" : "desactivado"} en la app móvil`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const activeStates = states.filter((state) => state.active).length
  const totalStates = states.length

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold">Gestión de Estados</h1>
          <p className="text-muted-foreground">
            Activa o desactiva estados en la app móvil ({activeStates}/{totalStates} activos)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {states.map((state) => (
          <Card
            key={state.id}
            className={`transition-all ${state.active ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{state.name}</CardTitle>
                <Switch checked={state.active} onCheckedChange={(checked) => toggleState(state.id, checked)} />
              </div>
              <CardDescription>{state.active ? "Visible en la app móvil" : "Oculto en la app móvil"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${state.active ? "bg-green-500" : "bg-gray-400"}`} />
                <Label className="text-sm">{state.active ? "Activo" : "Inactivo"}</Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
