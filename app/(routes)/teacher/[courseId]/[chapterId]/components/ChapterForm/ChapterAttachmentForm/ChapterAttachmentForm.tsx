"use client";

import { FileText, Image as ImageIcon, Video, Link as LinkIcon, Upload, Download, X, File, FileSpreadsheet, FileType } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

// Tipo para la respuesta de UploadThing
interface UploadThingFile {
  url: string;
  name?: string;
  size?: number;
  serverData?: {
    url?: string;
    name?: string;
    size?: number;
  };
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ChapterAttachmentFormProps, AttachmentType } from "./ChapterAttachmentForm.types";
import { TitleBlock } from "../../../../components";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
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
  
  // Parsear recursos iniciales correctamente
  const parsedInitialResources = parseResources(initialResources);
  console.log("🔍 Initial resources received:", initialResources);
  console.log("✅ Parsed initial resources:", parsedInitialResources);
  
  const [resources, setResources] = useState<Array<{ url: string; name: string; type?: string; size?: number }>>(parsedInitialResources);
  const [activeTab, setActiveTab] = useState<AttachmentType>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; progress: number }>>([]);

  const router = useRouter();

  // Filtrar recursos por tipo - incluir todos los recursos que no sean imágenes
  const documentResources = resources.filter(r => {
    const type = r.type?.toLowerCase() || "";
    return type === "pdf" || type === "word" || type === "excel" || type === "file" || (!type && r.url); // Incluir recursos sin tipo si tienen URL
  });
  const imageResources = resources.filter(r => r.type?.toLowerCase() === "image");
  
  console.log("📄 Document resources:", documentResources);
  console.log("🖼️ Image resources:", imageResources);

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

  // Actualizar recursos cuando cambien desde el servidor
  useEffect(() => {
    const parsedResources = parseResources(initialResources);
    console.log("📥 Resources updated from props (useEffect):", {
      initialResources,
      parsedResources,
      resourcesLength: parsedResources.length
    });
    setResources(parsedResources);
  }, [initialResources]);

  // Fallback: Si onClientUploadComplete no se ejecuta, intentar guardar manualmente cuando el progreso llegue a 100
  useEffect(() => {
    const completedUploads = uploadingFiles.filter(f => f.progress === 100);
    if (completedUploads.length > 0) {
      console.log("⚠️ Upload completed but onClientUploadComplete may not have fired.");
      console.log("💡 Attempting to reload data from server...");
      
      // Esperar un poco para que el servidor procese el archivo
      const timeout = setTimeout(async () => {
        try {
          // Recargar los datos del servidor
          router.refresh();
          
          // También intentar obtener los recursos actuales directamente desde la API
          // Esto es un fallback adicional en caso de que router.refresh() no funcione
          const response = await axios.get(`/api/course/${courseId}/chapter/${chapterId}`);
          if (response.data?.resources) {
            const serverResources = parseResources(response.data.resources);
            console.log("📥 Resources from server (fallback):", serverResources);
            
            // Si hay más recursos en el servidor que en el estado local, actualizar
            if (serverResources.length > resources.length) {
              console.log("✅ Found new resources on server, updating local state");
              setResources(serverResources);
              toast.success("File caricato con successo! 🔥");
            }
          }
        } catch (error) {
          console.error("❌ Error in fallback resource fetch:", error);
        } finally {
          setUploadingFiles([]);
        }
      }, 3000); // Aumentar el tiempo de espera a 3 segundos para dar más tiempo al servidor
      
      return () => clearTimeout(timeout);
    }
  }, [uploadingFiles, router, courseId, chapterId, resources.length]);

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

  const handleSave = async () => {
    try {
      const updateData: {
        title?: string;
        description?: string;
        isFree?: boolean;
        videoUrl?: string | null;
        documentUrl?: string | null;
        imageUrl?: string | null;
      } = {};

      // Obtener los valores del formulario de título si está disponible
      if (typeof window !== 'undefined' && (window as unknown as { __chapterTitleForm?: { getValues: () => { title?: string; description?: string; isFree?: boolean } } }).__chapterTitleForm) {
        const titleForm = (window as unknown as { __chapterTitleForm: { getValues: () => { title?: string; description?: string; isFree?: boolean } } }).__chapterTitleForm;
        const titleValues = titleForm.getValues();
        updateData.title = titleValues.title;
        updateData.description = titleValues.description;
        updateData.isFree = titleValues.isFree;
      }

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

      // Guardar todo (título y contenido)
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
                    onClientUploadComplete={(res) => {
                      if (res && res[0]?.url) {
                        onSubmit(res[0].url, "video");
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
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
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
            <div className="border-2 border-dashed border-border rounded-md p-8 hover:border-primary transition-colors bg-muted/20">
              <UploadButton
                endpoint="chapterDocument"
                input={{ courseId, chapterId }}
                onClientUploadComplete={(res) => {
                  console.log("🔥🔥🔥 === UPLOAD COMPLETE (CLIENT) === 🔥🔥🔥");
                  console.log("🔥 CALLBACK EXECUTED - res:", res);
                  // Limpiar archivos en progreso cuando el callback se ejecuta
                  setUploadingFiles([]);
                  console.log("Full response:", JSON.stringify(res, null, 2));
                  console.log("Response type:", typeof res);
                  console.log("Is array:", Array.isArray(res));
                  console.log("Response keys:", res ? Object.keys(res) : "null");
                  console.log("Response value:", res);
                  
                  try {
                    if (!res) {
                      console.error("⚠️ Response is null or undefined - UploadThing callback may not have executed");
                      console.log("💡 This is normal in development. The file is uploaded but callback may not fire.");
                      console.log("💡 Checking UploadThing dashboard to get file URL...");
                      
                      // Mostrar mensaje al usuario
                      toast.info("File uploaded to UploadThing. Please check the dashboard to get the URL.");
                      return;
                    }

                    const filesArray = Array.isArray(res) ? res : [res];
                    console.log("Files array:", filesArray);
                    
                    if (filesArray.length === 0) {
                      console.error("Empty files array");
                      toast.error("Errore: nessun file nella risposta");
                      return;
                    }

                    const newResources = filesArray
                      .map((file: UploadThingFile | { url?: string; name?: string; size?: number; serverData?: { url?: string; name?: string; size?: number } } | string, index: number) => {
                        console.log(`Processing file ${index}:`, file);
                        
                        // Type guard para verificar si es string
                        if (typeof file === 'string') {
                          const fileUrl = file;
                          const fileName = decodeURIComponent(fileUrl.split('/').pop() || '') || `Documento_${Date.now()}`;
                          return {
                            url: fileUrl,
                            name: fileName,
                            type: getFileType(fileUrl),
                            size: 0,
                          };
                        }
                        
                        // Type guard para verificar si tiene las propiedades esperadas
                        const fileObj = file as UploadThingFile | { url?: string; name?: string; size?: number; serverData?: { url?: string; name?: string; size?: number } };
                        
                        console.log(`File ${index} structure:`, {
                          hasUrl: !!(fileObj.url || (fileObj as { serverData?: { url?: string } }).serverData?.url),
                          hasName: !!fileObj.name,
                          hasSize: !!fileObj.size,
                          hasServerData: !!(fileObj as { serverData?: unknown }).serverData,
                          fileKeys: Object.keys(fileObj || {}),
                        });
                        
                        // UploadThing puede devolver los datos de diferentes formas:
                        // 1. file.url, file.name, file.size directamente
                        // 2. file.serverData.url, file.serverData.name, file.serverData.size
                        const serverData = (fileObj as { serverData?: { url?: string; name?: string; size?: number } }).serverData || {};
                        const fileUrl = fileObj.url || serverData.url || null;
                        const fileName = fileObj.name || serverData.name || (fileUrl ? decodeURIComponent(fileUrl.split('/').pop() || '') : undefined) || `Documento_${Date.now()}`;
                        const fileSize = fileObj.size || serverData.size || 0;
                        
                        console.log(`File ${index} extracted:`, { fileUrl, fileName, fileSize, serverData, originalFile: file });
                        
                        if (!fileUrl) {
                          console.error(`File ${index} has no URL:`, file);
                          return null;
                        }
                        
                        return {
                          url: fileUrl,
                          name: fileName,
                          type: getFileType(fileUrl),
                          size: fileSize,
                        };
                      })
                      .filter((resource): resource is { url: string; name: string; type: string; size: number } => {
                        const isValid = resource !== null && resource.url !== undefined;
                        if (!isValid) {
                          console.error("Filtered out invalid resource:", resource);
                        }
                        return isValid;
                      });

                    console.log("Valid new resources:", newResources);

                    if (newResources.length === 0) {
                      console.error("No valid resources after processing");
                      toast.error("Errore: nessun file valido processato");
                      return;
                    }

                    const updatedResources = [...resources, ...newResources];
                    console.log("All resources (old + new):", updatedResources);
                    
                    // Actualizar el estado local INMEDIATAMENTE para mostrar los archivos
                    setResources(updatedResources);
                    console.log("✅ Estado local actualizado, recursos visibles:", updatedResources);
                    
                    console.log("Saving to database...");
                    axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
                      resources: updatedResources,
                    }).then((response) => {
                      console.log("✅ Saved successfully:", response.data);
                      
                      // Verificar que los recursos se guardaron correctamente en la respuesta
                      if (response.data?.resources) {
                        const savedResources = Array.isArray(response.data.resources) 
                          ? response.data.resources 
                          : JSON.parse(response.data.resources || "[]");
                        setResources(savedResources);
                        console.log("✅ Resources updated from response:", savedResources);
                      } else {
                        // Si la respuesta no incluye recursos, mantener el estado local actualizado
                        console.log("⚠️ Response no incluye resources, manteniendo estado local");
                      }
                      
                      toast.success(`${newResources.length} document${newResources.length > 1 ? "i" : "o"} caricat${newResources.length > 1 ? "i" : "o"}! 🔥`);
                      
                      // NO hacer router.refresh() inmediatamente para evitar que se pierda el estado local
                      // El estado local ya está actualizado y los archivos son visibles
                      // router.refresh() se puede hacer después si es necesario, pero no es crítico
                      // porque el estado local ya tiene los datos correctos
                      setTimeout(() => {
                        router.refresh();
                      }, 500);
                    }).catch((error) => {
                      console.error("❌ Error saving to database:", error);
                      console.error("Error details:", error.response?.data || error.message);
                      toast.error(`Errore durante il salvataggio: ${error.response?.data?.message || error.message}`);
                      // Revertir al estado anterior si falla
                      setResources(resources);
                    });
                  } catch (error: unknown) {
                    console.error("❌ Exception in onClientUploadComplete:", error);
                    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
                    toast.error(`Errore: ${errorMessage}`);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  toast.error(`Errore durante il caricamento: ${error.message}`);
                  setUploadingFiles([]);
                }}
                onUploadBegin={(name) => {
                  console.log("Upload begin:", name);
                  setUploadingFiles(prev => [...prev, { name, progress: 0 }]);
                }}
                onUploadProgress={async (progress) => {
                  console.log("Upload progress (documents):", progress);
                  setUploadingFiles(prev => prev.map(f => ({ ...f, progress })));
                  
                  // Si el progreso llega a 100, el archivo se subió pero el callback puede no ejecutarse
                  if (progress === 100) {
                    console.log("⚠️ Upload progress reached 100% but onClientUploadComplete may not fire");
                    console.log("💡 Attempting to fetch file info from UploadThing response...");
                    
                    // Esperar un poco y luego intentar obtener los recursos desde el servidor
                    setTimeout(async () => {
                      try {
                        console.log("🔄 Polling server for new resources...");
                        const response = await axios.get(`/api/course/${courseId}/chapter/${chapterId}`);
                        if (response.data?.resources) {
                          const serverResources = parseResources(response.data.resources);
                          console.log("📥 Resources from server (polling):", serverResources);
                          
                          // Si hay más recursos en el servidor que en el estado local, actualizar
                          if (serverResources.length > resources.length) {
                            console.log("✅ Found new resources on server, updating local state");
                            setResources(serverResources);
                            toast.success("File caricato con successo! 🔥");
                            setUploadingFiles([]);
                            router.refresh();
                          } else {
                            console.log("⚠️ No new resources found on server yet");
                          }
                        }
                      } catch (error) {
                        console.error("❌ Error polling server for resources:", error);
                      }
                    }, 2000); // Esperar 2 segundos para que el servidor procese
                  }
                }}
                className="w-full ut-button:bg-transparent ut-button:border-none ut-button:shadow-none ut-button:hover:bg-transparent ut-button:text-foreground ut-button:w-full ut-button:min-h-[120px] ut-button:flex ut-button:flex-col ut-button:items-center ut-button:justify-center ut-button:gap-2 ut-button:cursor-pointer ut-allowed-content:hidden ut-button:p-0 ut-button:relative ut-button:z-10"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none z-0">
                <Upload className="w-8 h-8 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  {documentResources.length > 0 ? "Clicca per aggiungere più documenti" : "Clicca per selezionare i documenti"}
                </p>
                <p className="text-xs text-muted-foreground">Max 16MB (PDF, DOC, DOCX, etc.)</p>
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
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
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
              <UploadButton
                endpoint="chapterImages"
                input={{ courseId, chapterId }}
                onClientUploadComplete={(res) => {
                  console.log("=== UPLOAD COMPLETE (IMAGES) ===");
                  console.log("Full response:", JSON.stringify(res, null, 2));
                  console.log("Response type:", typeof res);
                  console.log("Is array:", Array.isArray(res));
                  // Limpiar archivos en progreso cuando el callback se ejecuta
                  setUploadingFiles([]);
                  
                  try {
                    if (!res) {
                      console.error("Response is null or undefined");
                      toast.error("Errore: risposta vuota da UploadThing");
                      return;
                    }

                    const filesArray = Array.isArray(res) ? res : [res];
                    console.log("Files array:", filesArray);
                    
                    if (filesArray.length === 0) {
                      console.error("Empty files array");
                      toast.error("Errore: nessun file nella risposta");
                      return;
                    }

                    const newResources = filesArray
                      .map((file: UploadThingFile, index: number) => {
                        console.log(`Processing file ${index}:`, file);
                        
                        const fileUrl = file.url;
                        const serverData = file.serverData || {};
                        const fileName = file.name || serverData.name || (fileUrl ? fileUrl.split('/').pop() : undefined) || `Immagine_${Date.now()}`;
                        const fileSize = file.size || serverData.size || 0;
                        
                        console.log(`File ${index} extracted:`, { fileUrl, fileName, fileSize, serverData });
                        
                        if (!fileUrl) {
                          console.error(`File ${index} has no URL:`, file);
                          return null;
                        }
                        
                        return {
                          url: fileUrl,
                          name: fileName,
                          type: "image",
                          size: fileSize,
                        };
                      })
                      .filter((resource): resource is { url: string; name: string; type: string; size: number } => {
                        const isValid = resource !== null && resource.url !== undefined;
                        if (!isValid) {
                          console.error("Filtered out invalid resource:", resource);
                        }
                        return isValid;
                      });

                    console.log("Valid new resources:", newResources);

                    if (newResources.length === 0) {
                      console.error("No valid resources after processing");
                      toast.error("Errore: nessun file valido processato");
                      return;
                    }

                    const updatedResources = [...resources, ...newResources];
                    console.log("All resources (old + new):", updatedResources);
                    
                    // Actualizar el estado local INMEDIATAMENTE para mostrar los archivos
                    setResources(updatedResources);
                    console.log("✅ Estado local actualizado, recursos visibles:", updatedResources);
                    
                    console.log("Saving to database...");
                    axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
                      resources: updatedResources,
                    }).then((response) => {
                      console.log("✅ Saved successfully:", response.data);
                      
                      // Verificar que los recursos se guardaron correctamente en la respuesta
                      if (response.data?.resources) {
                        const savedResources = Array.isArray(response.data.resources) 
                          ? response.data.resources 
                          : JSON.parse(response.data.resources || "[]");
                        setResources(savedResources);
                        console.log("✅ Resources updated from response:", savedResources);
                      } else {
                        // Si la respuesta no incluye recursos, mantener el estado local actualizado
                        console.log("⚠️ Response no incluye resources, manteniendo estado local");
                      }
                      
                      toast.success(`${newResources.length} immagin${newResources.length > 1 ? "i" : "e"} caricat${newResources.length > 1 ? "e" : "a"}! 🔥`);
                      
                      // NO hacer router.refresh() inmediatamente para evitar que se pierda el estado local
                      // El estado local ya está actualizado y los archivos son visibles
                      setTimeout(() => {
                        router.refresh();
                      }, 500);
                    }).catch((error) => {
                      console.error("❌ Error saving to database:", error);
                      console.error("Error details:", error.response?.data || error.message);
                      toast.error(`Errore durante il salvataggio: ${error.response?.data?.message || error.message}`);
                      // Revertir al estado anterior si falla
                      setResources(resources);
                    });
                  } catch (error: unknown) {
                    console.error("❌ Exception in onClientUploadComplete:", error);
                    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
                    toast.error(`Errore: ${errorMessage}`);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  toast.error(`Errore durante il caricamento: ${error.message}`);
                  setUploadingFiles([]);
                }}
                onUploadBegin={(name) => {
                  console.log("Upload begin:", name);
                  setUploadingFiles(prev => [...prev, { name, progress: 0 }]);
                }}
                onUploadProgress={async (progress) => {
                  console.log("Upload progress (images):", progress);
                  setUploadingFiles(prev => prev.map(f => ({ ...f, progress })));
                  
                  // Si el progreso llega a 100, el archivo se subió pero el callback puede no ejecutarse
                  if (progress === 100) {
                    console.log("⚠️ Upload progress reached 100% but onClientUploadComplete may not fire");
                    console.log("💡 Attempting to fetch file info from UploadThing response...");
                    
                    // Esperar un poco y luego intentar obtener los recursos desde el servidor
                    setTimeout(async () => {
                      try {
                        console.log("🔄 Polling server for new resources...");
                        const response = await axios.get(`/api/course/${courseId}/chapter/${chapterId}`);
                        if (response.data?.resources) {
                          const serverResources = parseResources(response.data.resources);
                          console.log("📥 Resources from server (polling):", serverResources);
                          
                          // Si hay más recursos en el servidor que en el estado local, actualizar
                          if (serverResources.length > resources.length) {
                            console.log("✅ Found new resources on server, updating local state");
                            setResources(serverResources);
                            toast.success("Immagine caricata con successo! 🔥");
                            setUploadingFiles([]);
                            router.refresh();
                          } else {
                            console.log("⚠️ No new resources found on server yet");
                          }
                        }
                      } catch (error) {
                        console.error("❌ Error polling server for resources:", error);
                      }
                    }, 2000); // Esperar 2 segundos para que el servidor procese
                  }
                }}
                className="w-full ut-button:bg-transparent ut-button:border-none ut-button:shadow-none ut-button:hover:bg-transparent ut-button:text-foreground ut-button:w-full ut-button:min-h-[120px] ut-button:flex ut-button:flex-col ut-button:items-center ut-button:justify-center ut-button:gap-2 ut-button:cursor-pointer ut-allowed-content:hidden ut-button:p-0 ut-button:relative ut-button:z-10"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none z-0">
                <Upload className="w-8 h-8 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                  {imageResources.length > 0 ? "Clicca per aggiungere più immagini" : "Clicca per selezionare un&apos;immagine"}
                </p>
                <p className="text-xs text-muted-foreground">Max 4MB</p>
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

