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
import { Plus, Edit, Trash2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export default function SupportInstitutionsPage() {
  const [supportInstitutions, setSupportInstitutions] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Aquí enviarías los datos al endpoint correspondiente
      const response = await api.post("support-institutions/", formData)

      toast({
        title: "Éxito",
        description: "Institución de apoyo guardada correctamente",
      })
      setIsDialogOpen(false)
      setFormData({ name: "", image: "" })
      setImageFile(null)
      fetchSupportInstitutions()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la institución de apoyo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSupportInstitutions = async () => {
    try {
      const response = await api.get("support-institutions/")
      setSupportInstitutions(response.data)
    } catch (error) {
      console.error("Error fetching support institutions:", error)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      // Crear URL temporal para preview
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
      await api.delete(`support-institutions/${id}/`)
      toast({
        title: "Eliminado",
        description: "Institución de apoyo eliminada correctamente",
      })
      fetchSupportInstitutions()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la institución de apoyo",
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
            <h1 className="text-3xl font-bold">Instituciones de Apoyo</h1>
            <p className="text-muted-foreground">Gestiona las instituciones que brindan apoyo</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({ name: "", image: "" })
                setImageFile(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Institución
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar" : "Agregar"} Institución de Apoyo</DialogTitle>
              <DialogDescription>Completa la información de la institución</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la Institución</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Fundación de Apoyo"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Imagen</Label>
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
          <CardTitle>Lista de Instituciones de Apoyo</CardTitle>
          <CardDescription>Todas las instituciones de apoyo registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supportInstitutions.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
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
