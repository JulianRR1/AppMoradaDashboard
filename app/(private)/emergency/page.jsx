"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormDraft } from "@/hooks/use-form-draft";
import api from "@/lib/api";
import states from "@/public/estados.json";





export default function EmergencyPage() {
  const [emergencyNumbers, setEmergencyNumbers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    number: "",
    state: "",
    municipality: "",
    emergencyType: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  // Borrador: conserva los datos si la sesión expira o se recarga (WCAG 2.2.1).
  const { clearDraft } = useFormDraft("emergency", formData, setFormData, isDialogOpen);

  const [availableStates, setAvailableStates] = useState(Object.keys(states));
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

  const handleStateChange = (value) => {
    setFormData({ ...formData, state: value, municipality: "" });
    const municipios = states[value] || [];
    setAvailableMunicipalities(municipios);
  };

  useEffect(() => {
    fetchEmergencyNumbers();
  }, []);

  // Validación en español ANTES de enviar (WCAG 3.3.1/3.3.3).
  const validate = () => {
    const next = {};
    if (!/^\d{10}$/.test(formData.number)) {
      next.number = "Ingresa un número de 10 dígitos.";
    }
    if (!formData.state) next.state = "Selecciona un estado.";
    if (!formData.municipality) next.municipality = "Selecciona un municipio.";
    if (!formData.emergencyType) next.emergencyType = "Selecciona un tipo de emergencia.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (editingItem) {
        await api.put(`emergency/${editingItem._id}/`, formData);
        toast({
          title: "Éxito",
          description: "Número de emergencia actualizado correctamente",
        });
      }
      else {
        await api.post("emergency/", formData);
        toast({
          title: "Éxito",
          description: "Número de emergencia guardado correctamente",
        });
      }

      setIsDialogOpen(false);
      setFormData({
        number: "",
        state: "",
        municipality: "",
        emergencyType: "",
      });
      setErrors({});
      clearDraft();
      setEditingItem(null);
      // Recargar la lista
      fetchEmergencyNumbers();
    } catch (error) {
      // Mensaje genérico en español; no exponemos el texto interno del backend.
      toast({
        title: "Error",
        description: "No se pudo guardar el número de emergencia. Revisa los datos e inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyNumbers = async () => {
    try {
      setIsLoadingData(true);
      const response = await api.get("emergency/");
      setEmergencyNumbers(response.data);
    } catch (error) {
      console.error("Error fetching emergency numbers:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
    const municipios = states[item.state] || [];
    setAvailableMunicipalities(municipios);
  };

  // La confirmación la maneja el propio DataTable; aquí solo se ejecuta el borrado.
  const deleteEmergency = async (id) => {
    try {
      await api.delete(`emergency/${id}/`);
      toast({
        title: "Eliminado",
        description: "Número de emergencia eliminado correctamente",
      });
      fetchEmergencyNumbers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el número de emergencia",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Números de emergencia</h1>
            <p className="text-muted-foreground">
              Gestiona los números de emergencia por estado y municipio
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  number: "",
                  state: "",
                  municipality: "",
                  emergencyType: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Número
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar" : "Agregar"} Número de Emergencia
              </DialogTitle>
              <DialogDescription>
                Completa la información del número de emergencia
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-sm text-muted-foreground">
                Los campos con <span aria-hidden="true">*</span> son obligatorios.
              </p>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">
                    Número de teléfono <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setFormData({ ...formData, number: value })
                    }}
                    placeholder="7774234426"
                    maxLength={10}
                    type="tel"
                    inputMode="numeric"
                    aria-required="true"
                    aria-invalid={errors.number ? "true" : undefined}
                    aria-describedby={errors.number ? "number-error" : undefined}
                  />
                  {errors.number && (
                    <p id="number-error" className="text-sm text-destructive">{errors.number}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">
                    Estado <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={handleStateChange}
                  >
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
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergencyType">
                    Tipo de Emergencia <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.emergencyType}
                    onValueChange={(value) => setFormData({ ...formData, emergencyType: value })}>
                    <SelectTrigger
                      id="emergencyType"
                      aria-label="Tipo de Emergencia"
                      aria-required="true"
                      aria-invalid={errors.emergencyType ? "true" : undefined}
                      aria-describedby={errors.emergencyType ? "emergencyType-error" : undefined}
                    >
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="denuncia anónima">Denuncia Anónima</SelectItem>
                      <SelectItem value="apoyo policial">Apoyo Policial</SelectItem>
                      <SelectItem value="línea mujeres">Línea Mujeres</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.emergencyType && (
                    <p id="emergencyType-error" className="text-sm text-destructive">{errors.emergencyType}</p>
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
        icon={Phone}
        columns={[
          { header: "Número", accessorKey: "number" },
          { header: "Estado", cell: (item) => <span className="capitalize">{item.state}</span> },
          { header: "Municipio", cell: (item) => <span className="capitalize">{item.municipality}</span> },
          { header: "Tipo", cell: (item) => <EmergencyTypePill type={item.emergencyType} /> },
        ]}
        data={emergencyNumbers}
        isLoading={isLoadingData}
        onEdit={handleEdit}
        onDelete={deleteEmergency}
        caption="Números de emergencia"
        getRowLabel={(item) => `número de ${item.municipality || item.state || "emergencia"}`}
      />
    </div>
  );
}

// Etiqueta de color por tipo de emergencia (coherente con la paleta del dashboard).
const TYPE_PILL = {
  "denuncia anónima": "bg-red-100 text-red-800",
  "apoyo policial": "bg-amber-100 text-amber-800",
  "línea mujeres": "bg-purple-100 text-purple-800",
};

function EmergencyTypePill({ type }) {
  const cls = TYPE_PILL[(type || "").toLowerCase()] || "bg-secondary text-secondary-foreground";
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full capitalize ${cls}`}>
      {type || "—"}
    </span>
  );
}
