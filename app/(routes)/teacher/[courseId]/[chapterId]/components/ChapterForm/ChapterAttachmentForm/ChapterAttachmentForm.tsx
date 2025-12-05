"use client";

import { FileText, Image as ImageIcon, Video, Link as LinkIcon, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import { UploadButton } from "@/utils/uploadthing";

export function ChapterAttachmentForm(props: ChapterAttachmentFormProps) {
  const { chapterId, courseId, videoUrl, documentUrl, imageUrl } = props;
  const [activeTab, setActiveTab] = useState<AttachmentType>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Determinar qué tipo de archivo está actualmente configurado
  useEffect(() => {
    if (videoUrl) {
      setActiveTab("video");
      setVideoUrlInput(videoUrl);
    } else if (documentUrl) {
      setActiveTab("document");
    } else if (imageUrl) {
      setActiveTab("image");
    }
  }, [videoUrl, documentUrl, imageUrl]);

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

  const handleFileUpload = async (file: File, type: AttachmentType) => {
    if (!file) return;

    // Validaciones según el tipo
    if (type === "image") {
      // Las imágenes siguen usando Cloudinary (optimización de imágenes)
      if (!file.type.startsWith("image/")) {
        toast.error("Per favore, seleziona un file immagine");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast.error("L'immagine deve essere inferiore a 4MB");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type || "");

        const response = await axios.post("/api/cloudinary/upload-chapter", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data?.url) {
          await onSubmit(response.data.url, type);
        } else {
          throw new Error("URL non ricevuta");
        }
      } catch (error: unknown) {
        console.error("Error uploading file:", error);
        const errorMessage = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
        toast.error(
          errorMessage || "Errore durante il caricamento dell'immagine"
        );
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
    // Videos y documentos ahora usan UploadThing (no se suben aquí, se usa UploadButton)
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
            {documentUrl && !isEditing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Documento attuale</Label>
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
                      onClick={() => handleRemove("document")}
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {documentUrl.split("/").pop() || "Documento"}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {(isEditing || !documentUrl) && (
              <div className="space-y-4 border rounded-md p-4">
                <Label>Carica documento (PDF, DOC, DOCX, etc.)</Label>
                <UploadButton
                  endpoint="chapterDocument"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]?.url) {
                      onSubmit(res[0].url, "document");
                      toast.success("Documento caricato con successo! 🔥");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Errore durante il caricamento: ${error.message}`);
                  }}
                  className="w-full ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90"
                />
                <p className="text-xs text-muted-foreground">Max 16MB (PDF, DOC, DOCX, etc.)</p>
                {documentUrl && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annulla
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <div className="space-y-4">
            {imageUrl && !isEditing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Immagine attuale</Label>
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
                      onClick={() => handleRemove("image")}
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <Image
                    src={imageUrl}
                    alt="Immagine del modulo"
                    width={500}
                    height={300}
                    className="rounded-md object-cover"
                  />
                </div>
              </div>
            )}

            {(isEditing || !imageUrl) && (
              <div className="space-y-4 border rounded-md p-4">
                <Label>Carica immagine</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "image");
                  }}
                  className="hidden"
                  id="chapter-image-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="chapter-image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-border rounded-md p-4 hover:border-primary transition-colors"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-primary" />
                      <p className="text-sm text-muted-foreground">Clicca per selezionare un&apos;immagine</p>
                      <p className="text-xs text-muted-foreground">Max 4MB</p>
                    </div>
                  )}
                </label>
                {imageUrl && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isUploading}
                  >
                    Annulla
                  </Button>
                )}
              </div>
            )}
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
}

