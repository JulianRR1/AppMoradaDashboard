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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import states from "@/public/estados.json";



import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
  const { toast } = useToast();

  const [availableStates, setAvailableStates] = useState(Object.keys(states));
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleStateChange = (value) => {
    setFormData({ ...formData, state: value, municipality: "" });
    const municipios = states[value] || [];
    setAvailableMunicipalities(municipios);
  };

  useEffect(() => {
    fetchEmergencyNumbers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setEditingItem(null);
      // Recargar la lista
      fetchEmergencyNumbers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "No se pudo guardar el número de emergencia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyNumbers = async () => {
    try {
      const response = await api.get("emergency/");
      setEmergencyNumbers(response.data);
    } catch (error) {
      console.error("Error fetching emergency numbers:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
    const municipios = states[item.state] || [];
    setAvailableMunicipalities(municipios);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    try {
      await api.delete(`emergency/${deleteId}/`);
      toast({
        title: "Eliminado",
        description: "Número de emergencia eliminado correctamente",
      });
      fetchEmergencyNumbers();
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el número de emergencia",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Números de Emergencia</h1>
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
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">Número de Teléfono</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    placeholder="7774234426"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emergencyType">Tipo de Emergencia</Label>
                  <Select
                    value={formData.emergencyType}
                    onValueChange={(value) => setFormData({ ...formData, emergencyType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="denuncia anónima">Denuncia Anónima</SelectItem>
                      <SelectItem value="apoyo policial">Apoyo Policial</SelectItem>
                      <SelectItem value="línea mujeres">Línea Mujeres</SelectItem>
                    </SelectContent>
                  </Select>
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
ao
      <Card>
        <CardHeader>
          <CardTitle>Lista de Números de Emergencia</CardTitle>
          <CardDescription>
            Todos los números registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencyNumbers.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.number}</TableCell>
                  <TableCell className="capitalize">{item.state}</TableCell>
                  <TableCell className="capitalize">
                    {item.municipality}
                  </TableCell>
                  <TableCell>{item.emergencyType}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(item._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el número de emergencia.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={executeDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
