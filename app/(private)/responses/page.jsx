"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
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
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { set } from "react-hook-form";

const API_ORIGIN = (() => {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return "";
  }
})();
export default function ResponsesPage() {
  const [testResponses, setTestResponses] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    phase: "",
    type: "",
    level: "",
    response: "",
    videoUrl: "",
    videoAlt: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    fetchTestResponses()
  }, [])

  useEffect(() => {
    setVideoPreview(toProxyPreviewUrl(formData.videoUrl || ""));
  }, [formData.videoUrl, isDialogOpen]);

  const convertToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const [meta, data] = reader.result.split(",");
      const contentType = meta.match(/:(.*?);/)[1];
      callback({ data, contentType });
    };
  };

  const handleMediaChange = (index, field, file) => {
    convertToBase64(file, (encoded) => {
      const newDescription = [...formData.description];
      newDescription[index] = { ...newDescription[index], [field]: encoded };
      setFormData({ ...formData, description: newDescription });
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      convertToBase64(file, (encoded) => {
        setFormData((prev) => ({ ...prev, [field]: encoded }));
      });
    }
  };

  const renderPreview = (encoded) => {
    console.log("Rendering preview for:", encoded);
    
    if (!encoded || !encoded.data || typeof encoded.data !== "string")
      return null;
    if (encoded.contentType.startsWith("image")) {
      return (
        <img
          src={`data:${encoded.contentType};base64,${encoded.data}`}
          alt="preview"
          className="w-full h-auto rounded-md"
        />
      );
    }
    if (encoded.contentType.startsWith("video")) {
      return (
        <video controls className="w-full rounded-md">
          <source
            src={`data:${encoded.contentType};base64,${encoded.data}`}
            type={encoded.contentType}
          />
        </video>
      );
    }
    return null;
  };

  function isInternalMedia(url = "") {
    return /^\/api\/media\/[a-z]+\/[A-Za-z0-9_\-]+$/i.test(url);
  }

  function extractDriveFileId(url = "") {
    try {
      const u = new URL(url);
      if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname)){
        return null;
      }

      const m1 = u.pathname.match(/\/file\/d\/([^/]+)(?:\/|$)/);
      if (m1?.[1]) return m1[1];

      const id = u.searchParams.get("id");
      return id || null;
    } catch {
      return null;
    }
  }

  function toProxyPreviewUrl(raw = "") {
    if (!raw) return null;
    if (isInternalMedia(raw)) {
      return new URL(raw, API_ORIGIN).toString();
    }

    const driveId = extractDriveFileId(raw);
    if (driveId) {
      return new URL(`/api/media/drive/${driveId}`, API_ORIGIN).toString();
    }

    return raw;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingItem) {
        await api.put(`response/${editingItem._id}/`, formData);
        toast({
          title: "Éxito",
          description: "Respuesta actualizada correctamente",
        })
      } else {
        await api.post("response/", formData);
        toast({
          title: "Éxito",
          description: "Respuesta guardada correctamente",
        })
      }

      
      setIsDialogOpen(false)
      setFormData({ phase: "", type: "", level: "", response: "", videoUrl: "", videoAlt: "" })
      fetchTestResponses()
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la respuesta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTestResponses = async () => {
    try {
      const response = await api.get("response/")
      setTestResponses(response.data)
    } catch (error) {
      console.error("Error fetching test responses:", error)
    }
  }

  const handleEdit = async (item) => {
    setIsDialogOpen(true)

    try {
      const response = await api.get(`response/${item._id}`);
      const fullItemData = response.data;
      setFormData(fullItemData);
      setEditingItem(fullItemData);

      setVideoPreview(toProxyPreviewUrl(fullItemData.videoUrl || ""));


    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información para editar.",
        variant: "destructive",
      });
      setIsDialogOpen(false);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (_id) => {
    try {
      await api.delete(`response/${_id}/`)
      toast({
        title: "Eliminado",
        description: "Respuesta eliminada correctamente",
      })
      fetchTestResponses()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la respuesta",
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
            <h1 className="text-3xl font-bold">Respuestas del Test</h1>
            <p className="text-muted-foreground">Gestiona las respuestas según el puntaje obtenido</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({ phase: "", type: "", level: "", response: "", videoUrl: "", videoAlt: "" })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Respuesta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]  max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar" : "Agregar"} Respuesta</DialogTitle>
              <DialogDescription>Configura la respuesta según el puntaje del test</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="part">Fase</Label>
                  <Select value={formData.phase} onValueChange={(value) => setFormData({ ...formData, phase: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Fase 1</SelectItem>
                      <SelectItem value="2">Fase 2</SelectItem>
                      <SelectItem value="3">Fase 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prevencion">Prevención</SelectItem>
                      <SelectItem value="accion">Acción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="response">Respuesta</Label>
                  <Textarea
                    id="response"
                    value={formData.response}
                    onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                    placeholder="Ten cuidado, la violencia aumentará... **¿Qué hacer?** Debes reconocer que te encuentras ya en las primeras fases del ciclo..."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Puedes usar **texto** para negrita y incluir la sección "¿Qué hacer?" al final
                  </p>
                  <Label>Video (url)</Label>
                  <Input
                    type = "text"
                    inputMode="url"
                    pattern="(https?://.*)|(/api/media/.*)"
                    placeholder="https://example.com/video.mp4"
                    value={formData.videoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <Label>Texto alternativo del video (alt)</Label>
                  <Input
                    type = "text"
                    placeholder="Texto alternativo para el video"
                    value={formData.videoAlt || ""}
                    onChange={(e) => setFormData({ ...formData, videoAlt: e.target.value })}
                  />

                  {videoPreview && (
                    <div className="mt-2 flex justify-center rounded-lg">
                      <video
                        src={videoPreview}
                        controls
                        className="w-40 h-auto rounded-lg"
                      >
                        Tu navegador no soporta la reproducción de video.
                      </video>
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
          <CardTitle>Lista de Respuestas</CardTitle>
          <CardDescription>Respuestas configuradas según puntaje del test</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fase</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Respuesta</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testResponses.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>Fase {item.phase}</TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell className="capitalize">{item.level}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.response}</TableCell>
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
