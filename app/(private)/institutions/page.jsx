"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus, Edit, Trash2, X, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFormDraft } from "@/hooks/use-form-draft"
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
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const { toast } = useToast()
  const { clearDraft } = useFormDraft("institutions", formData, setFormData, isDialogOpen)

  const validate = () => {
    const next = {}
    if (!formData.name?.trim()) next.name = "Ingresa el nombre de la institución."
    if (!formData.type) next.type = "Selecciona el tipo de institución."
    if (!formData.state) next.state = "Selecciona un estado."
    if (!formData.municipality) next.municipality = "Selecciona un municipio."
    if (!formData.hours?.trim()) next.hours = "Ingresa los horarios de atención."
    setErrors(next)
    return Object.keys(next).length === 0
  }

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
    if (!validate()) return
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
      setErrors({})
      clearDraft()
      fetchInstitutions()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la institución. Revisa los datos e inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInstitutions = async () => {
    try {
      setIsLoadingData(true)
      const response = await api.get("instance/")
      setInstitutions(response.data)
    } catch (error) {
      console.error("Error fetching institutions:", error)
    } finally {
      setIsLoadingData(false)
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Instituciones</h1>
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Los campos con <span aria-hidden="true">*</span> son obligatorios.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nombre de la Institución <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Centro de Apoyo Legal"
                    aria-required="true"
                    aria-invalid={errors.name ? "true" : undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <fieldset className="grid gap-2 p-4 border rounded-lg">
                  <legend className="text-sm font-medium px-1">Información de Contacto</legend>
                  <div className="grid gap-1">
                    <Label htmlFor="contact-tel">Teléfono</Label>
                    <Input
                      id="contact-tel"
                      placeholder="Teléfono"
                      value={formData.contact.tel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, tel: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
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
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="contact-address">Dirección</Label>
                    <Textarea
                      id="contact-address"
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
                </fieldset>

                <div className="grid gap-2">
                  <Label htmlFor="hours">
                    Horarios <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hours"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="Lunes a viernes: 9 AM - 6 PM"
                    aria-required="true"
                    aria-invalid={errors.hours ? "true" : undefined}
                    aria-describedby={errors.hours ? "hours-error" : undefined}
                  />
                  {errors.hours && (
                    <p id="hours-error" className="text-sm text-destructive">{errors.hours}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">
                    Tipo de Institución <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger
                      id="type"
                      aria-label="Tipo de Institución"
                      aria-required="true"
                      aria-invalid={errors.type ? "true" : undefined}
                      aria-describedby={errors.type ? "type-error" : undefined}
                    >
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
                  {errors.type && (
                    <p id="type-error" className="text-sm text-destructive">{errors.type}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">
                    Estado <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.state} onValueChange={handleStateChange}>
                    <SelectTrigger
                      id="state"
                      aria-label="Estado"
                      aria-required="true"
                      aria-invalid={errors.state ? "true" : undefined}
                      aria-describedby={errors.state ? "state-error" : undefined}
                    >
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
                  {errors.state && (
                    <p id="state-error" className="text-sm text-destructive">{errors.state}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="municipality">
                    Municipio <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                    disabled={!formData.state}
                  >
                    <SelectTrigger
                      id="municipality"
                      aria-label="Municipio"
                      aria-required="true"
                      aria-invalid={errors.municipality ? "true" : undefined}
                      aria-describedby={errors.municipality ? "municipality-error" : undefined}
                    >
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
                  {errors.municipality && (
                    <p id="municipality-error" className="text-sm text-destructive">{errors.municipality}</p>
                  )}

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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Eliminar servicio ${index + 1}`}
                            onClick={() => removeService(index)}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`service-${index}-title`}>Título del servicio</Label>
                        <Input
                          id={`service-${index}-title`}
                          placeholder="Título del servicio"
                          value={service.tittle}
                          onChange={(e) => updateService(index, "tittle", e.target.value)}
                        />
                        <Label htmlFor={`service-${index}-content`}>Descripción del servicio</Label>
                        <Textarea
                          id={`service-${index}-content`}
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

      <DataTable
        icon={Building}
        columns={[
          { header: "Nombre", accessorKey: "name" },
          { header: "Tipo", cell: (item) => <InstitutionTypePill type={item.type} /> },
          { header: "Estado", cell: (item) => <span className="capitalize">{item.state}</span> },
          { header: "Municipio", cell: (item) => <span className="capitalize">{item.municipality}</span> },
          { header: "Servicios", cell: (item) => <span>{(item.services?.length ?? 0)} servicios</span> },
        ]}
        data={institutions}
        isLoading={isLoadingData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        skeletonColumns={6}
        caption="Instituciones de apoyo"
        getRowLabel={(item) => `institución ${item.name || ""}`}
      />
    </div>
  )
}

// Etiqueta de color por tipo de atención (contraste WCAG AA verificado).
const INSTITUTION_TYPE_PILL = {
  "atencion a la violencia": "bg-pink-100 text-pink-800",
  "apoyo a personas con discapacidad": "bg-indigo-100 text-indigo-800",
}

function InstitutionTypePill({ type }) {
  const cls = INSTITUTION_TYPE_PILL[(type || "").toLowerCase()] || "bg-secondary text-secondary-foreground"
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full capitalize ${cls}`}>
      {type || "—"}
    </span>
  )
}
