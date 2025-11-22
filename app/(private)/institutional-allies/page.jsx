"use client"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export default function InstitutionalAlliesPage() {
  const [institutionalAllies, setInstitutionalAllies] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    image: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post("institutional-allies/", formData)

      toast({
        title: "Éxito",
        description: "Aliado institucional guardado correctamente",
      })
      setIsDialogOpen(false)
      setFormData({ title: "", image: "" })
      setImageFile(null)
      fetchInstitutionalAllies()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar el aliado institucional",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInstitutionalAllies = async () => {
    try {
      const response = await api.get("institutional-allies/")
      setInstitutionalAllies(response.data)
    } catch (error) {
      console.error("Error fetching institutional allies:", error)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image: imageUrl })
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`institutional-allies/${id}/`)
      toast({
        title: "Eliminado",
        description: "Aliado institucional eliminado correctamente",
      })
      fetchInstitutionalAllies()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el aliado institucional",
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
            <h1 className="text-3xl font-bold">Aliados Institucionales</h1>
            <p className="text-muted-foreground">Gestiona los aliados que apoyan el movimiento</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({ title: "", image: "" })
                setImageFile(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Aliado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar" : "Agregar"} Aliado Institucional</DialogTitle>
              <DialogDescription>Completa la información del aliado institucional</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título de la Institución</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Gobierno del Estado"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Imagen/Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      {imageFile ? imageFile.name : "Seleccionar Imagen"}
                    </Button>
                  </div>

                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Aliados Institucionales</CardTitle>
          <CardDescription>Todos los aliados institucionales registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutionalAllies.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
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
