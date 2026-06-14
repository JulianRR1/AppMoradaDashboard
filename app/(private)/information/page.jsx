"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Plus, Edit, Trash2, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useFormDraft } from "@/hooks/use-form-draft";
import { set } from "react-hook-form";

const API_ORIGIN = (() => {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return "";
  }
})();

function isInternalMedia(url = "") {
  return /^\/api\/media\/[a-z]+\/[A-Za-z0-9_\-]+$/i.test(url);
}

function extractDriveFileId(raw = "") {
  try {
    const u = new URL(raw);
    if (!/drive\.google\.com|docs\.google\.com/i.test(u.hostname)) return null;
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
  if (isInternalMedia(raw)) return new URL(raw, API_ORIGIN).toString();
  const driveId = extractDriveFileId(raw);
  if (driveId)
    return new URL(`/api/media/drive/${driveId}`, API_ORIGIN).toString();
  return raw; // externa tal cual
}

const categories = ["violencia", "seguridad", "legal"];

export default function InformationPage() {
  const [informationCards, setInformationCards] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "Preparación para sismos",
    description: [
      {
        subtitle: "Durante un sismo",
        information: "Agáchate, cúbrete y sujétate.",
        imageUrl: "https://example.com/image2.jpg",
        imageAlt: "Persona agachada durante un sismo",
        videoUrl: "https://example.com/video2.mp4",
        videoAlt: "Video sobre qué hacer durante un sismo",
      },
    ],
    fileUrl: "https://example.com/guide.pdf",
    fileAlt: "Guía completa de preparación para sismos",
    imageUrl: "https://example.com/cover.jpg",
    imageAlt: "Portada de la guía de preparación para sismos",
  });
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const { clearDraft } = useFormDraft(
    "information",
    formData,
    setFormData,
    isDialogOpen
  );

  const validate = () => {
    const next = {};
    if (!formData.title?.trim()) next.title = "Ingresa el título.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    fetchInformationCards();
  }, []);

  const convertToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const [meta, data] = reader.result.split(",");
      const contentType = meta.match(/:(.*?);/)[1];
      callback({ data, contentType });
    };
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      convertToBase64(file, (encoded) => {
        setFormData((prev) => ({ ...prev, [field]: encoded }));
      });
    }
  };

  const handleMediaChange = (index, field, file) => {
    convertToBase64(file, (encoded) => {
      const newDescription = [...formData.description];
      newDescription[index] = { ...newDescription[index], [field]: encoded };
      setFormData({ ...formData, description: newDescription });
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const dataToSend = formData;

      if (editingItem) {
        await api.put(`information/${editingItem._id}/`, dataToSend);
        toast({
          title: "Éxito",
          description: "Card informativa actualizada correctamente",
        });
      } else {
        await api.post("information/", dataToSend);
        toast({
          title: "Éxito",
          description: "Card informativa guardada correctamente",
        });
      }

      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: [
          {
            subtitle: "",
            information: "",
            imageUrl: "",
            imageAlt: "",
            videoUrl: "",
            videoAlt: "",
          },
        ],
        fileUrl: "",
        fileAlt: "",
        imageUrl: "",
        imageAlt: "",
      });
      setErrors({});
      clearDraft();
      fetchInformationCards();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Revisa los datos e inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInformationCards = async () => {
    try {
      setIsLoadingData(true);
      const response = await api.get("information/");
      setInformationCards(response.data);
    } catch (error) {
      console.error("Error fetching information cards:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const addDescriptionItem = () => {
    setFormData((prev) => ({
      ...prev,
      description: [
        ...prev.description,
        {
          subtitle: "",
          information: "",
          imageUrl: "",
          imageAlt: "",
          videoUrl: "",
          videoAlt: "",
        },
      ],
    }));
  };

  const removeDescriptionItem = (index) => {
    const newDescription = formData.description.filter((_, i) => i !== index);
    setFormData({ ...formData, description: newDescription });
  };

  const updateDescriptionItem = (index, field, value) => {
    const newDescription = [...formData.description];
    newDescription[index] = { ...newDescription[index], [field]: value };
    setFormData({ ...formData, description: newDescription });
  };

  const handleEdit = async (item) => {
    setIsDialogOpen(true);
    //console.log("Editing item:", item);
    try {
      const response = await api.get(`information/${item._id}`);
      const fullItemData = response.data;

      setFormData(fullItemData);
      //console.log("Editing item:", fullItemData);
      setEditingItem(fullItemData);
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
  };
  /*const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };*/

  const handleDelete = async (_id) => {
    try {
      await api.delete(`information/${_id}/`);
      toast({
        title: "Eliminado",
        description: "Card informativa eliminada correctamente",
      });
      fetchInformationCards();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la card informativa",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Informacion de apoyo</h1>
            <p className="text-muted-foreground">
              Gestiona el contenido informativo de la app
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  title: "",
                  description: [
                    {
                      subtitle: "",
                      information: "",
                      imageUrl: "",
                      imageAlt: "",
                      videoUrl: "",
                      videoAlt: "",
                    },
                  ],
                  fileUrl: "",
                  fileAlt: "",
                  imageUrl: "",
                  imageAlt: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar" : "Agregar"} Card Informativa
              </DialogTitle>
              <DialogDescription>
                Completa la información de la card
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Los campos con <span aria-hidden="true">*</span> son
                  obligatorios.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Título{" "}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="1 . ¿Qué es la violencia de género?"
                    aria-required="true"
                    aria-invalid={errors.title ? "true" : undefined}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                  {errors.title && (
                    <p id="title-error" className="text-sm text-destructive">
                      {errors.title}
                    </p>
                  )}
                </div>
                <Label htmlFor="imageUrl">Imagen principal</Label>
                <Input
                  id="imageUrl"
                  type="text"
                  inputMode="url"
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/cover.jpg  o  /api/media/drive/ID"
                />

                <Label htmlFor="imageAlt">Texto alterno de la imagen</Label>
                <Input
                  id="imageAlt"
                  type="text"
                  value={formData.imageAlt}
                  onChange={(e) =>
                    setFormData({ ...formData, imageAlt: e.target.value })
                  }
                  placeholder="Imagen representativa de preparación para sismos"
                />
                {formData.imageUrl && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={toProxyPreviewUrl(formData.imageUrl) || ""}
                      alt={formData.imageAlt || "Imagen principal"}
                      className="w-48 h-auto rounded-md"
                    />
                  </div>
                )}

                <Label htmlFor="fileUrl">Link del archivo PDF/Word</Label>
                <Input
                  id="fileUrl"
                  type="text"
                  inputMode="url"
                  value={formData.fileUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  placeholder="https://example.com/file.pdf  o  /api/media/drive/ID"
                />

                <Label htmlFor="fileAlt">Texto alterno del archivo</Label>
                <Input
                  id="fileAlt"
                  type="text"
                  value={formData.fileAlt}
                  onChange={(e) =>
                    setFormData({ ...formData, fileAlt: e.target.value })
                  }
                  placeholder="Guía completa de preparación para sismos"
                />
                {formData.fileUrl && (
                  <div className="mt-1">
                    <a
                      href={toProxyPreviewUrl(formData.fileUrl) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver archivo
                    </a>
                  </div>
                )}

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Descripción</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDescriptionItem}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Sección
                    </Button>
                  </div>

                  {formData.description.map((item, index) => {
                    const imgPrev = toProxyPreviewUrl(item.imageUrl || "");
                    const vidPrev = toProxyPreviewUrl(item.videoUrl || "");
                    return (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Sección {index + 1}</h4>
                          {formData.description.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Eliminar sección ${index + 1}`}
                              onClick={() => removeDescriptionItem(index)}
                            >
                              <X className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`desc-${index}-subtitle`}>Subtítulo</Label>
                          <Input
                            id={`desc-${index}-subtitle`}
                            placeholder="Subtítulo"
                            value={item.subtitle || ""}
                            onChange={(e) =>
                              updateDescriptionItem(
                                index,
                                "subtitle",
                                e.target.value
                              )
                            }
                          />
                          <Label htmlFor={`desc-${index}-information`}>Información</Label>
                          <Textarea
                            id={`desc-${index}-information`}
                            placeholder="Información"
                            value={item.information || ""}
                            onChange={(e) =>
                              updateDescriptionItem(
                                index,
                                "information",
                                e.target.value
                              )
                            }
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            {/* Imagen sección */}
                            <div className="grid gap-2">
                              <Label htmlFor={`desc-${index}-imageUrl`}>Imagen (URL)</Label>
                              <Input
                                id={`desc-${index}-imageUrl`}
                                type="text"
                                inputMode="url"
                                placeholder="https://example.com/image2.jpg  o  /api/media/drive/ID"
                                value={item.imageUrl || ""}
                                onChange={(e) =>
                                  updateDescriptionItem(
                                    index,
                                    "imageUrl",
                                    e.target.value
                                  )
                                }
                              />
                              <Label htmlFor={`desc-${index}-imageAlt`}>Texto alternativo imagen</Label>
                              <Input
                                id={`desc-${index}-imageAlt`}
                                type="text"
                                placeholder="Persona agachada durante un sismo"
                                value={item.imageAlt || ""}
                                onChange={(e) =>
                                  updateDescriptionItem(
                                    index,
                                    "imageAlt",
                                    e.target.value
                                  )
                                }
                              />
                              {item.imageUrl ? (
                                <div className="mt-2 flex justify-center">
                                  <img
                                    src={imgPrev || ""}
                                    alt={
                                      item.imageAlt ||
                                      `Imagen sección ${index + 1}`
                                    }
                                    className="w-32 h-auto rounded-md"
                                  />
                                </div>
                              ) : null}
                            </div>

                            {/* Video sección */}
                            <div className="grid gap-2">
                              <Label htmlFor={`desc-${index}-videoUrl`}>Video (URL)</Label>
                              <Input
                                id={`desc-${index}-videoUrl`}
                                type="text"
                                inputMode="url"
                                placeholder="https://example.com/video2.mp4  o  /api/media/drive/ID"
                                value={item.videoUrl || ""}
                                onChange={(e) =>
                                  updateDescriptionItem(
                                    index,
                                    "videoUrl",
                                    e.target.value
                                  )
                                }
                              />
                              <Label htmlFor={`desc-${index}-videoAlt`}>Texto alternativo video</Label>
                              <Input
                                id={`desc-${index}-videoAlt`}
                                type="text"
                                placeholder="Video sobre qué hacer durante un sismo"
                                value={item.videoAlt || ""}
                                onChange={(e) =>
                                  updateDescriptionItem(
                                    index,
                                    "videoAlt",
                                    e.target.value
                                  )
                                }
                              />
                              {item.videoUrl ? (
                                <div className="mt-2 flex justify-center">
                                  <video
                                    src={vidPrev || undefined}
                                    controls
                                    className="w-40 h-auto rounded-md"
                                  >
                                    {item.videoAlt ? (
                                      <track
                                        kind="descriptions"
                                        label="Descripción"
                                      />
                                    ) : null}
                                  </video>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
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
        icon={FileText}
        columns={[
          { header: "Título", accessorKey: "tittle" },
          { header: "Secciones", cell: (item) => `${item.description?.length ?? 0} secciones` },
        ]}
        data={informationCards}
        isLoading={isLoadingData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        skeletonColumns={3}
        caption="Información sobre violencia"
        getRowLabel={(item) => `información "${item.tittle || item.title || ""}"`}
      />
    </div>
  );
}
