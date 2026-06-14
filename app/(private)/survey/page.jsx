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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Edit, Trash2, Upload, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormDraft } from "@/hooks/use-form-draft";
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
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  const { clearDraft } = useFormDraft("survey", formData, setFormData, isDialogOpen);

  const validate = () => {
    const next = {};
    if (!formData.phase) next.phase = "Selecciona una fase.";
    if (!formData.part) next.part = "Selecciona una parte.";
    if (!formData.question?.trim()) next.question = "Escribe la pregunta.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    fetchSurveyQuestions();
  }, []);

  useEffect(() => {
    setVideoPreview(toProxyPreviewUrl(formData.videoUrl));
  }, [formData.videoUrl, isDialogOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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

      setErrors({});
      clearDraft();
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
          "No se pudo guardar la pregunta. Revisa los datos e inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyQuestions = async () => {
    try {
      setIsLoadingData(true);
      const response = await api.get("survey/");
      setSurveyQuestions(response.data);
    } catch (error) {
      console.error("Error fetching survey questions:", error);
    } finally {
      setIsLoadingData(false);
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Test de Preguntas</h1>
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
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-sm text-muted-foreground">
                Los campos con <span aria-hidden="true">*</span> son obligatorios.
              </p>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="phase">
                    Fase <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(value) =>
                      setFormData({ ...formData, phase: value })
                    }
                  >
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
                    <p id="phase-error" className="text-sm text-destructive">
                      {errors.phase}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="part">
                    Parte <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.part}
                    onValueChange={(value) =>
                      setFormData({ ...formData, part: value })
                    }
                  >
                    <SelectTrigger
                      id="part"
                      aria-label="Parte"
                      aria-required="true"
                      aria-invalid={errors.part ? "true" : undefined}
                      aria-describedby={errors.part ? "part-error" : undefined}
                    >
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
                  {errors.part && (
                    <p id="part-error" className="text-sm text-destructive">
                      {errors.part}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="question">
                    Pregunta <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="¿Tu pareja revisa tu celular sin permiso?"
                    aria-required="true"
                    aria-invalid={errors.question ? "true" : undefined}
                    aria-describedby={errors.question ? "question-error" : undefined}
                  />
                  {errors.question && (
                    <p id="question-error" className="text-sm text-destructive">
                      {errors.question}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="videoUrl">Video (URL)</Label>
                  <Input
                    id="videoUrl"
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

                  <Label htmlFor="videoAlt">Descripción del video (alt)</Label>
                  <Input
                    id="videoAlt"
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

      <div className="mb-4 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Sistema de Puntuación:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Sí:</strong> 12 puntos</li>
          <li>• <strong>A veces:</strong> 1 punto</li>
          <li>• <strong>No:</strong> 0 puntos</li>
        </ul>
      </div>

      <DataTable
        icon={HelpCircle}
        columns={[
          { header: "Parte", cell: (item) => `Parte ${item.part}` },
          { header: "Fase", cell: (item) => `Fase ${item.phase}` },
          { header: "Pregunta", cell: (item) => <span className="max-w-xs truncate block">{item.question}</span> },
          {
            header: "Video LSM",
            cell: (item) => (
              item.videoUrl ? (
                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">✓ Cargado</span>
              ) : (
                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">Sin video</span>
              )
            )
          },
        ]}
        data={surveyQuestions}
        isLoading={isLoadingData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        skeletonColumns={5}
        caption="Preguntas del test"
        getRowLabel={(item) => `pregunta "${(item.question || "").slice(0, 40)}"`}
      />
    </div>
  );
}
