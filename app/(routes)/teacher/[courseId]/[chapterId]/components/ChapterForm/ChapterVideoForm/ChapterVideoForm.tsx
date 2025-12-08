"use client";

import { Pencil, Video } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ChapterVideoFormProps } from "./ChapterVideoForm.types";

import { TitleBlock } from "../../../../components";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function ChapterVideoForm(props: ChapterVideoFormProps) {
  const { chapterId, courseId, videoUrl } = props;
  const [onEditVideo, setOnEditVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const onSubmit = async (url: string) => {
    try {
      await axios.patch(`/api/course/${courseId}/chapter/${chapterId}`, {
        videoUrl: url,
      });

      toast("Video aggiornato 🔥");

      router.refresh();
    } catch {
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      const response = await axios.post("/api/cloudinary/upload-chapter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.url) {
        onSubmit(response.data.url);
        setOnEditVideo(false);
        toast.success("Video caricato con successo con Cloudinary! 🔥");
      } else {
        throw new Error("No se recibió URL del servidor");
      }
    } catch (error: unknown) {
      console.error("Error uploading video:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante il caricamento");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-white rounded-md">
      <TitleBlock title="Aggiungi o modifica il video" icon={Video} />

      {videoUrl ? (
        <div className="space-y-2">
          {videoUrl.startsWith("http") && (
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
          )}
          {!videoUrl.startsWith("http") && (
            <video src={videoUrl} controls className="rounded-md w-full max-w-2xl" />
          )}
        </div>
      ) : (
        <p>Nessun video</p>
      )}

      <div className="mt-4 p-2 rounded-md border">
        <Button variant="secondary" onClick={() => setOnEditVideo(true)}>
          {onEditVideo ? "Trascina o seleziona il video" : "Modifica video"}

          <Pencil className="w-4 h-4" />
        </Button>

        {onEditVideo && (
          <div className="mt-2">
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
            {isUploading && (
              <p className="text-xs text-muted-foreground mt-2">Caricamento in corso...</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">Max 512GB (Cloudinary)</p>
          </div>
        )}
      </div>
    </div>
  );
}
