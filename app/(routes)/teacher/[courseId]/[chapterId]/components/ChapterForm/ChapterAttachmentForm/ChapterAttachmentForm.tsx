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
  // Estado para rastrear archivos en proceso de carga
  const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; progress: number }>>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  // Función helper para subir archivos a Cloudinary
  const uploadToCloudinary = async (file: File, type: "image" | "video" | "document"): Promise<{ url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await axios.post("/api/cloudinary/upload-chapter", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadingFiles(prev => prev.map(f => 
            f.name === file.name ? { ...f, progress } : f
          ));
        }
      },
    });

    if (response.data?.url) {
      return { url: response.data.url, public_id: response.data.public_id || "" };
    }
    throw new Error("No se recibió URL del servidor");
  };

  // Función para manejar la carga de documentos
  const handleDocumentUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    
    // Agregar archivos a la lista de carga
    setUploadingFiles(filesArray.map(f => ({ name: f.name, progress: 0 })));

    try {
      const uploadPromises = filesArray.map(file => uploadToCloudinary(file, "document"));
      const results = await Promise.all(uploadPromises);

      const newResources = results.map((result, index) => ({
        url: result.url,
        name: filesArray[index].name || `Documento_${Date.now()}_${index}`,
        type: getFileType(result.url),
        size: filesArray[index].size,
      }));

      const updatedResources = [...resources, ...newResources];
      
      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
        resources: updatedResources,
      });

      setResources(updatedResources);
      setUploadingFiles([]);
      setIsUploading(false);
      router.refresh();
      toast.success(`${newResources.length} document${newResources.length > 1 ? "i" : "o"} caricat${newResources.length > 1 ? "i" : "o"} con Cloudinary!`);
    } catch (error: unknown) {
      console.error("Error uploading documents:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante il caricamento");
      setUploadingFiles([]);
      setIsUploading(false);
    }
  };

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    
    // Agregar archivos a la lista de carga
    setUploadingFiles(filesArray.map(f => ({ name: f.name, progress: 0 })));

    try {
      const uploadPromises = filesArray.map(file => uploadToCloudinary(file, "image"));
      const results = await Promise.all(uploadPromises);

      const newResources = results.map((result, index) => ({
        url: result.url,
        name: filesArray[index].name || `Immagine_${Date.now()}_${index}`,
        type: "image",
        size: filesArray[index].size,
      }));

      const updatedResources = [...resources, ...newResources];
      
      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
        resources: updatedResources,
      });

      setResources(updatedResources);
      setUploadingFiles([]);
      setIsUploading(false);
      router.refresh();
      toast.success(`${newResources.length} immagin${newResources.length > 1 ? "i" : "e"} caricat${newResources.length > 1 ? "e" : "a"} con Cloudinary!`);
    } catch (error: unknown) {
      console.error("Error uploading images:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante il caricamento");
      setUploadingFiles([]);
      setIsUploading(false);
    }
  };

  // Función para manejar la carga de videos
  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    setUploadingFiles([{ name: file.name, progress: 0 }]);

    try {
      const result = await uploadToCloudinary(file, "video");
      onSubmit(result.url, "video");
      setUploadingFiles([]);
      setIsUploading(false);
      toast.success("Video caricato con successo con Cloudinary! 🔥");
    } catch (error: unknown) {
      console.error("Error uploading video:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante il caricamento");
      setUploadingFiles([]);
      setIsUploading(false);
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
                    Supporta YouTube, Vimeo, Cloudflare Stream (HLS/DASH/iframe) y otros servicios de video
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
                  <div className="relative">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleVideoUpload(file);
                        }
                      }}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {uploadingFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploadingFiles.map((file, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            {file.name}: {file.progress}%
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Max 512GB (Cloudinary)</p>
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
            {/* Debug info - remover en producción */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 bg-muted rounded text-xs">
                <p>Total resources: {resources.length}</p>
                <p>Document resources: {documentResources.length}</p>
                <p>Resources: {JSON.stringify(resources, null, 2)}</p>
              </div>
            )}
            
            {/* Lista de documentos cargados en grid */}
            {documentResources.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {documentResources.map((resource, index) => {
                  const resourceIndex = resources.findIndex(r => r.url === resource.url);
                  const fileIcon = getFileIcon(resource.type || "");
                  return (
                    <div
                      key={`doc-${index}-${resource.url}`}
                      className="relative group border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="aspect-square flex flex-col items-center justify-center p-4 bg-muted/50">
                        <div className="w-12 h-12 flex items-center justify-center mb-2">
                          {fileIcon}
                        </div>
                        <p className="text-xs font-medium text-center line-clamp-2 px-1" title={resource.name}>
                          {resource.name || "Sin nombre"}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/90 hover:bg-background shadow-sm"
                          asChild
                        >
                          <a 
                            href={resource.url}
                            download={resource.name || "download"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm"
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
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-muted/20 mb-4">
                <p className="text-sm text-muted-foreground">Nessun documento caricato</p>
                <p className="text-xs text-muted-foreground mt-1">Total risorse nel database: {resources.length}</p>
                {resources.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p className="font-semibold">Risorse trovate (ma non mostrate come documenti):</p>
                    <ul className="list-disc list-inside mt-1">
                      {resources.map((r, i) => (
                        <li key={i}>{r.name || r.url} (tipo: {r.type || "sin tipo"})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Área de carga con diseño de la foto 2 */}
            <div className="relative border-2 border-dashed border-border rounded-md p-8 hover:border-primary transition-colors bg-muted/20">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                multiple
                onChange={(e) => handleDocumentUpload(e.target.files)}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none z-0">
                <Upload className="w-8 h-8 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  {documentResources.length > 0 ? "Clicca per aggiungere più documenti" : "Clicca per selezionare i documenti"}
                </p>
                <p className="text-xs text-muted-foreground">Max 16MB (PDF, DOC, DOCX, etc.) - Cloudinary</p>
                {uploadingFiles.length > 0 && (
                  <div className="mt-2 space-y-1 w-full">
                    {uploadingFiles.map((file, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground text-center">
                        {file.name}: {file.progress}%
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Puoi caricare fino a 10 documenti alla volta (Max 16MB ciascuno)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <div className="space-y-4">
            {/* Lista de imágenes cargadas en grid */}
            {imageResources.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {imageResources.map((resource, index) => {
                  const resourceIndex = resources.findIndex(r => r.url === resource.url);
                  return (
                    <div
                      key={index}
                      className="relative group border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all duration-200"
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
                      <div className="p-2 bg-card">
                        <p className="text-xs font-medium truncate">{resource.name}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/90 hover:bg-background shadow-sm"
                          asChild
                        >
                          <a 
                            href={resource.url}
                            download={resource.name || "download"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm"
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
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Área de carga con diseño de la foto 2 */}
            <div className="relative border-2 border-dashed border-border rounded-md p-8 hover:border-primary transition-colors bg-muted/20">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none z-0">
                <Upload className="w-8 h-8 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  {imageResources.length > 0 ? "Clicca per aggiungere più immagini" : "Clicca per selezionare un&apos;immagine"}
                </p>
                <p className="text-xs text-muted-foreground">Max 4MB - Cloudinary</p>
                {uploadingFiles.length > 0 && (
                  <div className="mt-2 space-y-1 w-full">
                    {uploadingFiles.map((file, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground text-center">
                        {file.name}: {file.progress}%
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

