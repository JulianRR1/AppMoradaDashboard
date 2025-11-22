"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  const { toast } = useToast()

  useEffect(() => {
    fetchWhatsAppLines()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      fetchWhatsAppLines()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la línea de WhatsApp",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWhatsAppLines = async () => {
    try {
      const response = await api.get("line/")
      setWhatsappLines(response.data)
    } catch (error) {
      console.error("Error fetching WhatsApp lines:", error)
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Línea WhatsApp</h1>
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
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">Número de WhatsApp</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="5523489128"
                    required
                  />
                  <p className="text-sm text-muted-foreground">Ingresa el número sin espacios ni guiones</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del Operador</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="jose julian"
                    required
                  />
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Líneas WhatsApp</CardTitle>
          <CardDescription>Todos los operadores de WhatsApp registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Nombre del Operador</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {whatsappLines.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      {item.number}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
