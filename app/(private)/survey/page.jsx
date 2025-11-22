"use client";

//setVideoFile(null)

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const API_ORIGIN = (() => {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return "";
  }
})();

export default function SurveyPage() {
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    part: "",
    phase: "",
    question: "",
    videoUrl: "",
    videoAlt: "",
  });
  const [videoPreview, setVideoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSurveyQuestions();
  }, []);

  useEffect(() => {
    setVideoPreview(toProxyPreviewUrl(formData.videoUrl));
  }, [formData.videoUrl, isDialogOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        await api.put(`survey/${editingItem._id}/`, {
          part: formData.part,
          phase: formData.phase,
          question: formData.question,
          videoUrl: formData.videoUrl || "",
          videoAlt: formData.videoAlt || "",
        });
        toast({
          title: "Éxito",
          description: "Pregunta actualizada correctamente",
        });
      } else {
        await api.post("survey/", {
          part: formData.part,
          phase: formData.phase,
          question: formData.question,
          videoUrl: formData.videoUrl || "",
          videoAlt: formData.videoAlt || "",
        });
        toast({
          title: "Éxito",
          description: "Pregunta guardada correctamente",
        });
      }

      // Si hay video, enviarlo por separado
      /*if (videoFile) {
        const formDataVideo = new FormData();
        formDataVideo.append("video", videoFile);
        formDataVideo.append("questionId", response.data.id);

        // Aquí enviarías el video a otro endpoint si es necesario
        // await api.post('survey/video/', formDataVideo, {
        //   headers: { 'Content-Type': 'multipart/form-data' }
        // })
      }*/

      setIsDialogOpen(false);
      setFormData({
        part: "",
        phase: "",
        question: "",
        videoUrl: "",
        videoAlt: "",
      });
      fetchSurveyQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "No se pudo guardar la pregunta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyQuestions = async () => {
    try {
      const response = await api.get("survey/");
      setSurveyQuestions(response.data);
    } catch (error) {
      console.error("Error fetching survey questions:", error);
    }
  };

  function isInternalMedia(url = "") {
    // Si tu backend también acepta "/media/..." sin /api, añade ese prefijo aquí
    return /^\/api\/media\/[a-z]+\/[A-Za-z0-9_\-]+$/i.test(url);
  }

  function extractDriveFileId(raw = "") {
    try {
      const u = new URL(raw);
      if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname))
        return null;

      // /file/d/<id>[/...]
      const m1 = u.pathname.match(/\/file\/d\/([^/]+)(?:\/|$)/);
      if (m1?.[1]) return m1[1];

      // ?id=<id>
      const id = u.searchParams.get("id");
      return id || null;
    } catch {
      // Si no es una URL absoluta, no es Drive
      return null;
    }
  }

  /** Devuelve una URL ABSOLUTA para <video src> o <img src>, usando proxy si hace falta */
  function toProxyPreviewUrl(raw = "") {
    if (!raw) return null;

    // a) Ya interna -> absolutiza
    if (isInternalMedia(raw)) {
      return new URL(raw, API_ORIGIN).toString();
    }

    // b) Google Drive -> usa tu proxy
    const driveId = extractDriveFileId(raw);
    if (driveId) {
      return new URL(`/api/media/drive/${driveId}`, API_ORIGIN).toString();
    }

    // c) Externa (mp4/CDN/etc.) -> usar tal cual
    return raw;
  }

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      part: item.part || "",
      phase: item.phase || "",
      question: item.question || "",
      videoUrl: item.videoUrl || "",
      videoAlt: item.videoAlt || "",
    });
    setVideoPreview(toProxyPreviewUrl(item.videoUrl || ""));
    setIsDialogOpen(true);
  };

  const handleDelete = async (_id) => {
    try {
      await api.delete(`survey/${_id}/`);
      toast({
        title: "Eliminado",
        description: "Pregunta eliminada correctamente",
      });
      fetchSurveyQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la pregunta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Test de Preguntas</h1>
            <p className="text-muted-foreground">
              Gestiona las preguntas del test de evaluación
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  part: "",
                  phase: "",
                  question: "",
                  videoUrl: "",
                  videoAlt: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Pregunta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar" : "Agregar"} Pregunta
              </DialogTitle>
              <DialogDescription>
                Completa la información de la pregunta del test
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="phase">Fase</Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(value) =>
                      setFormData({ ...formData, phase: value })
                    }
                  >
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
                  <Label htmlFor="part">Parte</Label>
                  <Select
                    value={formData.part}
                    onValueChange={(value) =>
                      setFormData({ ...formData, part: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la parte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Parte 1</SelectItem>
                      <SelectItem value="2">Parte 2</SelectItem>
                      <SelectItem value="3">Parte 3</SelectItem>
                      <SelectItem value="4">Parte 4</SelectItem>
                      <SelectItem value="5">Parte 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="question">Pregunta</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="¿Tu pareja revisa tu celular sin permiso?"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Vudeo (URL)</Label>
                  <Input
                    type="text"
                    inputMode="url"
                    pattern="(https?://.*)|(/api/media/.*)"
                    title="Pega un URL http(s) o una ruta /api/media/..."
                    placeholder="https://example.com/video.mp4"
                    value={formData.videoUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                  />

                  <Label>Descripción del video (alt)</Label>
                  <Input
                    type="text"
                    placeholder="Descripción del video para accesibilidad"
                    value={formData.videoAlt || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, videoAlt: e.target.value })
                    }
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
                  {/*{imagePreview && <img src={imagePreview} alt={formData.imageAlt || "Imagen"} className="w-full rounded" />}*/}
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
          <CardTitle>Lista de Preguntas</CardTitle>
          <CardDescription>
            Todas las preguntas del test registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Sistema de Puntuación:</h3>
            <ul className="text-sm space-y-1">
              <li>
                • <strong>Sí:</strong> 12 puntos
              </li>
              <li>
                • <strong>A veces:</strong> 1 punto
              </li>
              <li>
                • <strong>No:</strong> 0 puntos
              </li>
            </ul>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parte</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Pregunta</TableHead>
                <TableHead>Video LSM</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveyQuestions.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>Parte {item.part}</TableCell>
                  <TableCell>Fase {item.phase}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.question}
                  </TableCell>
                  <TableCell>
                    {item.videoUrl ? (
                      <span className="text-green-600">✓ Cargado</span>
                    ) : (
                      <span className="text-gray-400">Sin video</span>
                    )}
                  </TableCell>
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
                        onClick={() => handleDelete(item._id)}
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
      </Card>
    </div>
  );
}
