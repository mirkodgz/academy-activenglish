"use client";

import { FileText, Image as ImageIcon, Video, Link as LinkIcon, Upload, Download, X, File, FileSpreadsheet, FileType } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ChapterAttachmentFormProps, AttachmentType } from "./ChapterAttachmentForm.types";
import { TitleBlock } from "../../../../components";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useRef } from "react";
import { UploadButton } from "@/utils/uploadthing";

// Función helper para parsear recursos desde Prisma JSON
function parseResources(resources: unknown): Array<{ url: string; name: string; type?: string; size?: number }> {
  if (!resources) return [];
  
  // Si ya es un array, devolverlo
  if (Array.isArray(resources)) {
    return resources;
  }
  
  // Si es un string JSON, parsearlo
  if (typeof resources === 'string') {
    try {
      const parsed = JSON.parse(resources);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing resources JSON:", e);
      return [];
    }
  }
  
  // Si es un objeto, intentar convertirlo a array
  if (typeof resources === 'object') {
    return Array.isArray(resources) ? resources : [];
  }
  
  return [];
}

export function ChapterAttachmentForm(props: ChapterAttachmentFormProps) {
  const { chapterId, courseId, videoUrl, documentUrl, imageUrl, resources: initialResources } = props;
  
  // Parsear recursos iniciales correctamente (similar a cómo CourseImage maneja imageCourse)
  const parsedInitialResources = parseResources(initialResources);
  
  // Estado local para los recursos (similar a cómo CourseImage usa useState para image)
  const [resources, setResources] = useState<Array<{ url: string; name: string; type?: string; size?: number }>>(parsedInitialResources || []);
  const [activeTab, setActiveTab] = useState<AttachmentType>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Filtrar recursos por tipo - incluir todos los recursos que no sean imágenes
  const documentResources = resources.filter(r => {
    const type = r.type?.toLowerCase() || "";
    return type === "pdf" || type === "word" || type === "excel" || type === "file" || (!type && r.url); // Incluir recursos sin tipo si tienen URL
  });
  const imageResources = resources.filter(r => r.type?.toLowerCase() === "image");

  // Determinar qué tipo de archivo está actualmente configurado
  useEffect(() => {
    if (videoUrl) {
      setActiveTab("video");
      setVideoUrlInput(videoUrl);
    } else if (documentResources.length > 0) {
      setActiveTab("document");
    } else if (imageResources.length > 0) {
      setActiveTab("image");
    } else if (documentUrl) {
      setActiveTab("document");
    } else if (imageUrl) {
      setActiveTab("image");
    }
  }, [videoUrl, documentUrl, imageUrl, documentResources.length, imageResources.length]);

  // Actualizar recursos cuando cambien desde el servidor (similar a cómo CourseImage actualiza cuando cambia imageCourse)
  useEffect(() => {
    const parsedResources = parseResources(initialResources);
    if (parsedResources && parsedResources.length > 0) {
      setResources(parsedResources);
    }
  }, [initialResources]);


  const onSubmit = async (url: string, type: AttachmentType) => {
    try {
      const updateData: {
        videoUrl?: string | null;
        documentUrl?: string | null;
        imageUrl?: string | null;
      } = {};

      // Limpiar los otros tipos cuando se selecciona uno nuevo
      if (type === "video") {
        updateData.videoUrl = url;
        updateData.documentUrl = null;
        updateData.imageUrl = null;
      } else if (type === "document") {
        updateData.documentUrl = url;
        updateData.videoUrl = null;
        updateData.imageUrl = null;
      } else if (type === "image") {
        updateData.imageUrl = url;
        updateData.videoUrl = null;
        updateData.documentUrl = null;
      }

      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, updateData);

      toast(`${type === "video" ? "Video" : type === "document" ? "Documento" : "Immagine"} aggiornato 🔥`);
      router.refresh();
      setIsEditing(false);
    } catch {
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  const handleVideoUrlSubmit = () => {
    if (videoUrlInput.trim()) {
      onSubmit(videoUrlInput.trim(), "video");
    } else {
      toast.error("Inserisci un URL valido");
    }
  };


  const handleRemove = async (type: AttachmentType) => {
    try {
      const updateData: {
        videoUrl?: null;
        documentUrl?: null;
        imageUrl?: null;
      } = {};

      if (type === "video") {
        updateData.videoUrl = null;
      } else if (type === "document") {
        updateData.documentUrl = null;
      } else if (type === "image") {
        updateData.imageUrl = null;
      }

      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, updateData);
      toast(`${type === "video" ? "Video" : type === "document" ? "Documento" : "Immagine"} rimosso`);
      router.refresh();
      setActiveTab(null);
      setVideoUrlInput("");
    } catch {
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  // Función para manejar la carga de archivos con Cloudinary (similar a CourseImage)
  const handleFileUpload = async (file: File, type: "document" | "image") => {
    // Validar tamaño según el tipo
    const maxSize = type === "image" ? 4 * 1024 * 1024 : 16 * 1024 * 1024; // 4MB para imágenes, 16MB para documentos
    if (file.size > maxSize) {
      toast.error(`Il file deve essere inferiore a ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `activenglish/chapters/${chapterId}`);

      const response = await axios.post("/api/cloudinary/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.url) {
        const newResource = {
          url: response.data.url,
          name: response.data.name || file.name,
          type: type === "image" ? "image" : getFileType(response.data.url),
          size: response.data.size || file.size,
        };

        // Agregar nuevo recurso al array existente
        const updatedResources = [...resources, newResource];
        
        // Guardar en la BD
        await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
          resources: updatedResources,
        });

        // Actualizar estado local
        setResources(updatedResources);
        setIsEditing(false);
        router.refresh();
        toast.success(`${type === "image" ? "Immagine" : "Documento"} caricat${type === "image" ? "a" : "o"} con successo!`);
      } else {
        throw new Error("URL non ricevuta");
      }
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || `Errore durante il caricamento del ${type === "image" ? "immagine" : "documento"}`);
    } finally {
      setIsUploading(false);
      // Resetear el input
      if (type === "document" && documentInputRef.current) {
        documentInputRef.current.value = "";
      }
      if (type === "image" && imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    try {
      const updateData: {
        title?: string;
        description?: string;
        isFree?: boolean;
        videoUrl?: string | null;
        documentUrl?: string | null;
        imageUrl?: string | null;
        resources?: Array<{ url: string; name: string; type?: string; size?: number }>;
      } = {};

      // Obtener los valores del formulario de título si está disponible
      if (typeof window !== 'undefined' && (window as unknown as { __chapterTitleForm?: { getValues: () => { title?: string; description?: string; isFree?: boolean } } }).__chapterTitleForm) {
        const titleForm = (window as unknown as { __chapterTitleForm: { getValues: () => { title?: string; description?: string; isFree?: boolean } } }).__chapterTitleForm;
        const titleValues = titleForm.getValues();
        updateData.title = titleValues.title;
        updateData.description = titleValues.description;
        updateData.isFree = titleValues.isFree;
      }

      // SIEMPRE guardar los recursos actuales del estado local
      updateData.resources = resources;

      // Si se seleccionó "Nessuno", limpiar todo
      if (activeTab === null) {
        updateData.videoUrl = null;
        updateData.documentUrl = null;
        updateData.imageUrl = null;
      } else if (activeTab === "video" && videoUrlInput.trim()) {
        // Si hay una URL de video ingresada, guardarla
        updateData.videoUrl = videoUrlInput.trim();
        updateData.documentUrl = null;
        updateData.imageUrl = null;
      }

      // Guardar todo (título, contenido y recursos)
      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, updateData);
      toast("Modulo salvato 🔥");
      router.refresh();
      setIsEditing(false);
    } catch {
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  return (
    <div className="mt-6 p-6 bg-card rounded-md">
      <TitleBlock title="Contenuto del modulo" icon={FileText} />
      <p className="text-sm text-muted-foreground mb-4">
        Scegli un tipo di contenuto: video (URL o file), documento o immagine
      </p>

      <Tabs value={activeTab || "none"} onValueChange={(value) => {
        if (value === "none") {
          setActiveTab(null);
        } else {
          setActiveTab(value as AttachmentType);
          setIsEditing(true);
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="none">Nessuno</TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-4 h-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="document">
            <FileText className="w-4 h-4 mr-2" />
            Documento
          </TabsTrigger>
          <TabsTrigger value="image">
            <ImageIcon className="w-4 h-4 mr-2" />
            Immagine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="none" className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>Nessun contenuto allegato</p>
            <p className="text-sm mt-2">Seleziona un tipo di contenuto sopra per aggiungerne uno</p>
          </div>
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <div className="space-y-4">
            {videoUrl && !isEditing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Video attuale</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Modifica
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove("video")}
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
                {videoUrl.startsWith("http") ? (
                  <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground mb-2">URL Video:</p>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {videoUrl}
                    </a>
                  </div>
                ) : (
                  <video src={videoUrl} controls className="rounded-md w-full max-w-2xl" />
                )}
              </div>
            )}

            {(isEditing || !videoUrl) && (
              <div className="space-y-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label>Opzione 1: Inserisci URL del video</Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleVideoUrlSubmit}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Salva URL
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supporta YouTube, Vimeo y otros servicios de video
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Oppure</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opzione 2: Carica file video</Label>
                  <UploadButton
                    endpoint="chapterVideo"
                    onClientUploadComplete={(res: unknown) => {
                      if (res && Array.isArray(res) && res[0] && typeof res[0] === 'object' && 'url' in res[0]) {
                        const url = (res[0] as { url: string }).url;
                        onSubmit(url, "video");
                        toast.success("Video caricato con successo! 🔥");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`Errore durante il caricamento: ${error.message}`);
                    }}
                    className="w-full ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90"
                  />
                  <p className="text-xs text-muted-foreground">Max 512GB (UploadThing)</p>
                </div>

                {videoUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setVideoUrlInput(videoUrl);
                    }}
                  >
                    Annulla
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="document" className="mt-4">
          <div className="space-y-4">
            {/* Lista de documentos cargados en grid compacto */}
            {documentResources.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                {documentResources.map((resource, index) => {
                  const resourceIndex = resources.findIndex(r => r.url === resource.url);
                  const fileIcon = getFileIcon(resource.type || "");
                  return (
                    <div
                      key={`doc-${index}-${resource.url}`}
                      className="relative group border rounded-md overflow-hidden bg-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center p-2 bg-muted/50 min-h-[80px]">
                        <div className="w-8 h-8 flex items-center justify-center mb-1">
                          {fileIcon}
                        </div>
                        <p className="text-[10px] font-medium text-center line-clamp-2 px-1" title={resource.name}>
                          {resource.name || "Sin nombre"}
                        </p>
                      </div>
                      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-background/90 hover:bg-background shadow-sm"
                          asChild
                        >
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download={resource.name || undefined}
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm"
                          onClick={async () => {
                            const updatedResources = resources.filter((_, i) => i !== resourceIndex);
                            setResources(updatedResources);
                            try {
                              await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
                                resources: updatedResources,
                              });
                              toast.success("Documento rimosso");
                              router.refresh();
                            } catch {
                              toast.error("Errore durante la rimozione");
                              setResources(resources);
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Área de carga con Cloudinary (similar a CourseImage) */}
            <div className="border-2 border-dashed border-border rounded-md p-8 hover:border-primary transition-colors bg-muted/20 relative">
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, "document");
                  }
                }}
                className="hidden"
                id="chapter-document-upload"
                disabled={isUploading}
                multiple
              />
              <label
                htmlFor="chapter-document-upload"
                className="flex flex-col items-center justify-center cursor-pointer min-h-[120px]"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {documentResources.length > 0 ? "Clicca per aggiungere più documenti" : "Clicca per selezionare i documenti"}
                    </p>
                    <p className="text-xs text-muted-foreground">Max 16MB (PDF, DOC, DOCX, etc.)</p>
                  </div>
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Puoi caricare fino a 10 documenti alla volta (Max 16MB ciascuno)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <div className="space-y-4">
            {/* Lista de imágenes cargadas en grid compacto */}
            {imageResources.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                {imageResources.map((resource, index) => {
                  const resourceIndex = resources.findIndex(r => r.url === resource.url);
                  return (
                    <div
                      key={index}
                      className="relative group border rounded-md overflow-hidden bg-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="aspect-square relative bg-muted/50">
                        <Image
                          src={resource.url}
                          alt={resource.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="p-1 bg-card">
                        <p className="text-[10px] font-medium truncate">{resource.name}</p>
                      </div>
                      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-background/90 hover:bg-background shadow-sm"
                          asChild
                        >
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download={resource.name || undefined}
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm"
                          onClick={async () => {
                            const updatedResources = resources.filter((_, i) => i !== resourceIndex);
                            setResources(updatedResources);
                            try {
                              await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
                                resources: updatedResources,
                              });
                              toast.success("Immagine rimossa");
                              router.refresh();
                            } catch {
                              toast.error("Errore durante la rimozione");
                              setResources(resources);
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Área de carga con Cloudinary (similar a CourseImage) */}
            <div className="border-2 border-dashed border-border rounded-md p-8 hover:border-primary transition-colors bg-muted/20 relative">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, "image");
                  }
                }}
                className="hidden"
                id="chapter-image-upload"
                disabled={isUploading}
                multiple
              />
              <label
                htmlFor="chapter-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer min-h-[120px]"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {imageResources.length > 0 ? "Clicca per aggiungere più immagini" : "Clicca per selezionare un&apos;immagine"}
                    </p>
                    <p className="text-xs text-muted-foreground">Max 4MB</p>
                  </div>
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Puoi caricare fino a 10 immagini alla volta (Max 4MB ciascuna)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end border-t pt-4">
        <Button onClick={handleSave}>
          Salva
        </Button>
      </div>
    </div>
  );

  function getFileType(url: string): string {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (["xls", "xlsx"].includes(extension)) return "excel";
    if (["doc", "docx"].includes(extension)) return "word";
    return "file";
  }

  function getFileIcon(type: string) {
    switch (type) {
      case "pdf":
        return <FileText className="w-12 h-12 text-red-600" />;
      case "word":
        return <FileType className="w-12 h-12 text-blue-600" />;
      case "excel":
        return <FileSpreadsheet className="w-12 h-12 text-green-600" />;
      default:
        return <File className="w-12 h-12 text-primary" />;
    }
  }
}

