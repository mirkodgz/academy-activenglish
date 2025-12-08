"use client";

import { FileText, Image as ImageIcon, X, Download, File } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { TitleBlock } from "../../../../components";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Resource {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

interface ChapterResourcesFormProps {
  chapterId: string;
  courseId: string;
  resources?: Resource[] | null;
}

export function ChapterResourcesForm(props: ChapterResourcesFormProps) {
  const { chapterId, courseId, resources: initialResources } = props;
  const [resources, setResources] = useState<Resource[]>(initialResources || []);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialResources) {
      setResources(initialResources);
    }
  }, [initialResources]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        // Determinar tipo según extensión
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
        formData.append("type", isImage ? "image" : "document");

        const response = await axios.post("/api/cloudinary/upload-chapter", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return {
          url: response.data.url,
          name: file.name,
          type: getFileType(response.data.url),
          size: file.size,
        };
      });

      const newResources = await Promise.all(uploadPromises);
      const updatedResources = [...resources, ...newResources];
      setResources(updatedResources);
      saveResources(updatedResources);
      toast.success(`${newResources.length} risors${newResources.length > 1 ? "e" : "a"} aggiunt${newResources.length > 1 ? "e" : "a"} con Cloudinary!`);
    } catch (error: unknown) {
      console.error("Error uploading resources:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante il caricamento");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    saveResources(updatedResources);
    toast.success("Risorsa rimossa");
  };

  const saveResources = async (resourcesToSave: Resource[]) => {
    try {
      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
        resources: resourcesToSave,
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving resources:", error);
      toast.error("Errore durante il salvataggio delle risorse");
    }
  };

  const getFileType = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (["xls", "xlsx"].includes(extension)) return "excel";
    if (["doc", "docx"].includes(extension)) return "word";
    return "file";
  };

  const getFileIcon = (type?: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-red-600" />;
      case "excel":
        return <FileText className="w-5 h-5 text-green-600" />;
      case "word":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mt-6 p-6 bg-card rounded-md">
      <TitleBlock title="Risorse del modulo" icon={FileText} />
      <p className="text-sm text-muted-foreground mb-4">
        Aggiungi immagini, PDF, Excel, Word e altri file come risorse per questo modulo
      </p>

      {/* Lista de recursos existentes */}
      {resources.length > 0 && (
        <div className="space-y-2 mb-4">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(resource.type)}
                <div className="flex-1 min-w-0">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-primary truncate block"
                  >
                    {resource.name}
                  </a>
                  {resource.size && (
                    <p className="text-xs text-muted-foreground">{formatFileSize(resource.size)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async (e) => {
                    e.preventDefault();
                    const proxyUrl = `/api/download-file?url=${encodeURIComponent(resource.url)}&filename=${encodeURIComponent(resource.name || "download")}`;
                    try {
                      const response = await axios.get(proxyUrl, { 
                        responseType: 'blob',
                        validateStatus: (status) => status < 500 
                      });
                      
                      if (response.data?.useDirect) {
                        // Crear descarga con URL firmada
                        const downloadUrl = response.data.directUrl;
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = resource.name || "download";
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else if (response.data instanceof Blob) {
                        const url = window.URL.createObjectURL(response.data);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = resource.name || "download";
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } else {
                        window.open(resource.url, '_blank');
                      }
                    } catch (error) {
                      console.error("Error fetching download proxy:", error);
                      window.open(resource.url, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveResource(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para subir nuevos recursos */}
      <div className="mt-4">
        <Label className="mb-2 block">Aggiungi risorse</Label>
        <Input
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isUploading}
          className="cursor-pointer"
        />
        {isUploading && (
          <p className="text-xs text-muted-foreground mt-2">Caricamento in corso...</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Puoi caricare fino a 10 file alla volta (Immagini: 4MB, Documenti: 16MB) - Cloudinary
        </p>
      </div>
    </div>
  );
}

