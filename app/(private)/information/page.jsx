"use client";

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
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
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
  const { toast } = useToast();

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
      fetchInformationCards();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "No se pudo guardar la card informativa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInformationCards = async () => {
    try {
      const response = await api.get("information/");
      setInformationCards(response.data);
    } catch (error) {
      console.error("Error fetching information cards:", error);
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Informacion de apoyo</h1>
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
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="1 . ¿Qué es la violencia de género?"
                    required
                  />
                </div>
                <Label>Imagen principal</Label>
                <Input
                  type="text"
                  inputMode="url"
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/cover.jpg  o  /api/media/drive/ID"
                />

                <Label>Texto alterno de la imagen</Label>
                <Input
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

                <Label>Link del archivo PDF/Word</Label>
                <Input
                  type="text"
                  inputMode="url"
                  value={formData.fileUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  placeholder="https://example.com/file.pdf  o  /api/media/drive/ID"
                />

                <Label>Texto alterno del archivo</Label>
                <Input
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
                              onClick={() => removeDescriptionItem(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Input
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
                          <Textarea
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
                              <Label>Imagen (URL)</Label>
                              <Input
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
                              <Label>Texto alternativo imagen</Label>
                              <Input
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
                              <Label>Video (URL)</Label>
                              <Input
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
                              <Label>Texto alternativo video</Label>
                              <Input
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Informacion sobre violecnia</CardTitle>
          <CardDescription>
            Todas la informacion registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Secciones</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {informationCards.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.tittle}</TableCell>
                  <TableCell>{item.description.length} secciones</TableCell>
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
