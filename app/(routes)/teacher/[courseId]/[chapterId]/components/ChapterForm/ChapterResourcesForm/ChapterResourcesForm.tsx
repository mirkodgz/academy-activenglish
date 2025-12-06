"use client";

import { FileText, Image as ImageIcon, X, Download, File } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { TitleBlock } from "../../../../components";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";

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
  const router = useRouter();

  useEffect(() => {
    if (initialResources) {
      setResources(initialResources);
    }
  }, [initialResources]);

  const handleUploadComplete = (res: Array<{ url: string; name?: string; size?: number }>) => {
    if (res && res.length > 0) {
      const newResources = res.map((file) => ({
        url: file.url,
        name: file.name || "Archivo sin nombre",
        type: getFileType(file.url),
        size: file.size || 0,
      }));

      const updatedResources = [...resources, ...newResources];
      setResources(updatedResources);
      saveResources(updatedResources);
      toast.success(`${newResources.length} risors${newResources.length > 1 ? "e" : "a"} aggiunt${newResources.length > 1 ? "e" : "a"}! 🔥`);
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
      toast.error("Errore durante il salvataggio delle risorse 😭");
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
                  asChild
                >
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                  </a>
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
        <UploadButton
          endpoint="chapterResources"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            toast.error(`Errore durante il caricamento: ${error.message}`);
          }}
          className="w-full ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Puoi caricare fino a 10 file alla volta (Immagini: 4MB, Documenti: 16MB)
        </p>
      </div>
    </div>
  );
}

