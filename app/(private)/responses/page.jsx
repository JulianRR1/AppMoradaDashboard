"use client"

import { useState, useEffect, use } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
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
import { Plus, Edit, Trash2, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFormDraft } from "@/hooks/use-form-draft"
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
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const { toast } = useToast()
  const { clearDraft } = useFormDraft("responses", formData, setFormData, isDialogOpen)
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
      if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname)) {
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

  const validate = () => {
    const next = {};
    if (!formData.phase) next.phase = "Selecciona una fase.";
    if (!formData.type) next.type = "Selecciona un tipo.";
    if (!formData.level) next.level = "Selecciona un nivel.";
    if (!formData.response?.trim()) next.response = "Escribe la respuesta.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return;
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
      setErrors({})
      clearDraft()
      fetchTestResponses()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la respuesta. Revisa los datos e inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTestResponses = async () => {
    try {
      setIsLoadingData(true)
      const response = await api.get("response/")
      setTestResponses(response.data)
    } catch (error) {
      console.error("Error fetching test responses:", error)
    } finally {
      setIsLoadingData(false)
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Respuestas del Test</h1>
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">Los campos con <span aria-hidden="true">*</span> son obligatorios.</p>
                <div className="grid gap-2">
                  <Label htmlFor="phase">Fase <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Select value={formData.phase} onValueChange={(value) => setFormData({ ...formData, phase: value })}>
                    <SelectTrigger
                      id="phase"
                      aria-label="Fase"
                      aria-required="true"
                      aria-invalid={errors.phase ? "true" : undefined}
                      aria-describedby={errors.phase ? "phase-error" : undefined}
                    >
                      <SelectValue placeholder="Selecciona la fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Fase 1</SelectItem>
                      <SelectItem value="2">Fase 2</SelectItem>
                      <SelectItem value="3">Fase 3</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.phase && (
                    <p id="phase-error" className="text-sm text-destructive">{errors.phase}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger
                      id="type"
                      aria-label="Tipo"
                      aria-required="true"
                      aria-invalid={errors.type ? "true" : undefined}
                      aria-describedby={errors.type ? "type-error" : undefined}
                    >
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prevencion">Prevención</SelectItem>
                      <SelectItem value="accion">Acción</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p id="type-error" className="text-sm text-destructive">{errors.type}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="level">Nivel <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger
                      id="level"
                      aria-label="Nivel"
                      aria-required="true"
                      aria-invalid={errors.level ? "true" : undefined}
                      aria-describedby={errors.level ? "level-error" : undefined}
                    >
                      <SelectValue placeholder="Selecciona el nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p id="level-error" className="text-sm text-destructive">{errors.level}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="response">Respuesta <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Textarea
                    id="response"
                    value={formData.response}
                    onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                    placeholder="Ten cuidado, la violencia aumentará... **¿Qué hacer?** Debes reconocer que te encuentras ya en las primeras fases del ciclo..."
                    rows={6}
                    aria-required="true"
                    aria-invalid={errors.response ? "true" : undefined}
                    aria-describedby={errors.response ? "response-error" : undefined}
                  />
                  {errors.response && (
                    <p id="response-error" className="text-sm text-destructive">{errors.response}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Puedes usar **texto** para negrita y incluir la sección "¿Qué hacer?" al final
                  </p>
                  <Label htmlFor="videoUrl">Video (URL)</Label>
                  <Input
                    id="videoUrl"
                    type="text"
                    inputMode="url"
                    pattern="(https?://.*)|(/api/media/.*)"
                    placeholder="https://example.com/video.mp4"
                    value={formData.videoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <Label htmlFor="videoAlt">Texto alternativo del video (alt)</Label>
                  <Input
                    id="videoAlt"
                    type="text"
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

      <DataTable
        icon={Shield}
        columns={[
          { header: "Fase", cell: (item) => `Fase ${item.phase}` },
          { header: "Tipo", cell: (item) => <span className="capitalize">{item.type}</span> },
          { header: "Nivel", cell: (item) => <LevelPill level={item.level} /> },
          { header: "Respuesta", cell: (item) => <span className="max-w-xs truncate block">{item.response}</span> },
        ]}
        data={testResponses}
        isLoading={isLoadingData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        skeletonColumns={5}
        caption="Respuestas del test"
        getRowLabel={(item) => `respuesta de fase ${item.phase} (${item.level})`}
      />
    </div>
  )
}

// Etiqueta de color por nivel de riesgo (verde→ámbar→rojo).
const LEVEL_PILL = {
  baja: "bg-green-100 text-green-800",
  media: "bg-amber-100 text-amber-800",
  alta: "bg-red-100 text-red-800",
}

function LevelPill({ level }) {
  const cls = LEVEL_PILL[(level || "").toLowerCase()] || "bg-secondary text-secondary-foreground"
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full capitalize ${cls}`}>
      {level || "—"}
    </span>
  )
}
