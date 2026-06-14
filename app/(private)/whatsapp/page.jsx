"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus, Edit, Trash2, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFormDraft } from "@/hooks/use-form-draft"
import api from "@/lib/api"


export default function WhatsAppPage() {
  const [whatsappLines, setWhatsappLines] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    number: "",
    name: "",
  })
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const { toast } = useToast()

  // Borrador: conserva los datos si la sesión expira o se recarga (WCAG 2.2.1).
  const { clearDraft } = useFormDraft("whatsapp", formData, setFormData, isDialogOpen)

  useEffect(() => {
    fetchWhatsAppLines()
  }, [])

  // Validación en español ANTES de enviar (WCAG 3.3.1/3.3.3).
  const validate = () => {
    const next = {}
    if (!/^\d{10}$/.test(formData.number)) next.number = "Ingresa un número de 10 dígitos."
    if (!formData.name?.trim()) next.name = "Ingresa el nombre del operador."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      if (editingItem) {
        await api.put(`line/${editingItem._id}/`, formData)
        toast({
          title: "Éxito",
          description: "Línea de WhatsApp actualizada correctamente",
        })
      } else {
        await api.post("line/", formData)
        toast({
          title: "Éxito",
          description: "Línea de WhatsApp guardada correctamente",
        })
      }

      setIsDialogOpen(false)
      setFormData({ number: "", name: "" })
      setErrors({})
      clearDraft()
      fetchWhatsAppLines()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la línea de WhatsApp. Revisa los datos e inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWhatsAppLines = async () => {
    try {
      setIsLoadingData(true)
      const response = await api.get("line/")
      setWhatsappLines(response.data)
    } catch (error) {
      console.error("Error fetching WhatsApp lines:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async (_id) => {
    try {
      await api.delete(`line/${_id}/`)
      toast({
        title: "Eliminado",
        description: "Línea de WhatsApp eliminada correctamente",
      })
      fetchWhatsAppLines()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la línea de WhatsApp",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Línea WhatsApp</h1>
            <p className="text-muted-foreground">Gestiona los números de contacto de WhatsApp</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({ number: "", name: "" })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Línea
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar" : "Agregar"} Línea WhatsApp</DialogTitle>
              <DialogDescription>Completa la información del operador de WhatsApp</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-sm text-muted-foreground">
                Los campos con <span aria-hidden="true">*</span> son obligatorios.
              </p>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">
                    Número de WhatsApp <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setFormData({ ...formData, number: value })
                    }}
                    placeholder="5523489128"
                    maxLength={10}
                    type="tel"
                    inputMode="numeric"
                    required
                    aria-required="true"
                    aria-invalid={errors.number ? "true" : undefined}
                    aria-describedby={errors.number ? "number-help number-error" : "number-help"}
                  />
                  <p id="number-help" className="text-sm text-muted-foreground">
                    Ingresa el número sin espacios ni guiones. Ej. 5512345678 (10 dígitos).
                  </p>
                  {errors.number && (
                    <p id="number-error" className="text-sm text-destructive">{errors.number}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nombre del Operador <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="jose julian"
                    required
                    aria-required="true"
                    aria-invalid={errors.name ? "true" : undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        icon={MessageCircle}
        columns={[
          {
            header: "Número",
            cell: (item) => (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                {item.number}
              </div>
            )
          },
          { header: "Nombre del Operador", cell: (item) => <span className="capitalize">{item.name}</span> },
        ]}
        data={whatsappLines}
        isLoading={isLoadingData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        skeletonColumns={3}
        caption="Líneas de WhatsApp"
        getRowLabel={(item) => `línea de ${item.name || item.number || "WhatsApp"}`}
      />
    </div>
  )
}
