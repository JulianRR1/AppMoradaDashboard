"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import states from "@/public/estados.json"


const mexicanStates = [
  "aguascalientes",
  "baja california",
  "baja california sur",
  "campeche",
  "chiapas",
  "chihuahua",
  "coahuila",
  "colima",
  "durango",
  "guanajuato",
  "guerrero",
  "hidalgo",
  "jalisco",
  "mexico",
  "michoacan",
  "morelos",
  "nayarit",
  "nuevo leon",
  "oaxaca",
  "puebla",
  "queretaro",
  "quintana roo",
  "san luis potosi",
  "sinaloa",
  "sonora",
  "tabasco",
  "tamaulipas",
  "tlaxcala",
  "veracruz",
  "yucatan",
  "zacatecas",
  "cdmx",
]

const institutionTypes = ["atencion a la violencia", "apoyo a personas con discapacidad"]

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    contact: {
      tel: "",
      email: "",
      address: "",
    },
    hours: "",
    type: "",
    services: [{ tittle: "", content: "" }],
    state: "",
    municipality: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [availableStates, setAvailableStates] = useState(Object.keys(states))
  const [availableMunicipalities, setAvailableMunicipalities] = useState([])

  const handleStateChange = (value) => {
    setFormData({ ...formData, state: value, municipality: "" })
    const municipios = states[value] || []
    setAvailableMunicipalities(municipios)
  }


  useEffect(() => {
    fetchInstitutions();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingItem) {
        await api.put(`instance/${editingItem._id}/`, formData)
        toast({
          title: "Éxito",
          description: "Institución actualizada correctamente",
        })
      } else {
        await api.post("instance/", formData)
        toast({
          title: "Éxito",
          description: "Institución guardada correctamente",
        })
      }

      setIsDialogOpen(false)
      setFormData({
        name: "",
        contact: { tel: "", email: "", address: "" },
        hours: "",
        type: "",
        services: [{ tittle: "", content: "" }],
        state: "",
        municipality: "",
      })
      fetchInstitutions()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la institución",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInstitutions = async () => {
    try {
      const response = await api.get("instance/")
      setInstitutions(response.data)
    } catch (error) {
      console.error("Error fetching institutions:", error)
    }
  }

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { tittle: "", content: "" }],
    })
  }

  const removeService = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index)
    setFormData({ ...formData, services: newServices })
  }

  const updateService = (index, field, value) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData({ ...formData, services: newServices })
  }

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true); const municipios = states[item.state] || [];
    setAvailableMunicipalities(municipios);
  }

  const handleDelete = async (_id) => {
    try {
      await api.delete(`instance/${_id}/`)
      toast({
        title: "Eliminado",
        description: "Institución eliminada correctamente",
      })
      fetchInstitutions()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la institución",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Instituciones</h1>
            <p className="text-muted-foreground">Gestiona las instituciones por estado</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({
                  name: "",
                  contact: { tel: "", email: "", address: "" },
                  hours: "",
                  type: "",
                  services: [{ tittle: "", content: "" }],
                  state: "",
                  municipality: "",
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Institución
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar" : "Agregar"} Institución</DialogTitle>
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
                    placeholder="Centro de Apoyo Legal"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Información de Contacto</Label>
                  <div className="grid gap-2 p-4 border rounded-lg">
                    <Input
                      placeholder="Teléfono"
                      value={formData.contact.tel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, tel: e.target.value },
                        })
                      }
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, email: e.target.value },
                        })
                      }
                    />
                    <Textarea
                      placeholder="Dirección"
                      value={formData.contact.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, address: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hours">Horarios</Label>
                  <Input
                    id="hours"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="Lunes a viernes: 9 AM - 6 PM"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Institución</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select value={formData.state} onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStates.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}

                      {/*{mexicanStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state.charAt(0).toUpperCase() + state.slice(1)}
                        </SelectItem>
                      ))}*/}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="municipality">Municipio</Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                    disabled={!formData.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMunicipalities.map((municipio) => (
                        <SelectItem key={municipio} value={municipio}>
                          {municipio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/*<Input
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                    placeholder="cuernavaca"
                    required
                  />*/}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Servicios</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addService}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Servicio
                    </Button>
                  </div>

                  {formData.services.map((service, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Servicio {index + 1}</h4>
                        {formData.services.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeService(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Input
                          placeholder="Título del servicio"
                          value={service.tittle}
                          onChange={(e) => updateService(index, "tittle", e.target.value)}
                        />
                        <Textarea
                          placeholder="Descripción del servicio"
                          value={service.content}
                          onChange={(e) => updateService(index, "content", e.target.value)}
                        />
                      </div>
                    </Card>
                  ))}
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
          <CardTitle>Lista de Instituciones</CardTitle>
          <CardDescription>Todas las instituciones registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell className="capitalize">{item.state}</TableCell>
                  <TableCell className="capitalize">{item.municipality}</TableCell>
                  <TableCell>{item.services.length} servicios</TableCell>
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
