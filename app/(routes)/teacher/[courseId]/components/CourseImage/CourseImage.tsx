"use client";
import { useState, useRef } from "react";

import { FileImage, Pencil, Upload } from "lucide-react";
import { TitleBlock } from "../TitleBlock";
import { CourseImageProps } from "./CourseImage.types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

export function CourseImage(props: CourseImageProps) {
  const { idCourse, imageCourse } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(imageCourse);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      toast.error("Per favore, seleziona un file immagine");
      return;
    }

    // Validar tamaño (4MB máximo)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("L'immagine deve essere inferiore a 4MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/cloudinary/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.url) {
        await onChangeImage(response.data.url);
      } else {
        throw new Error("URL non ricevuta");
      }
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(
        errorMessage || "Errore durante il caricamento dell'immagine"
      );
    } finally {
      setIsUploading(false);
      // Resetear el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onChangeImage = async (imageUrl: string) => {
    try {
      await axios.patch(`/api/course/${idCourse}`, {
        imageUrl: imageUrl,
      });
      setImage(imageUrl);
      setIsEditing(false);
      router.refresh();
      toast("Immagine aggiornata correttamente 🎉");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  return (
    <div className="p-4 rounded-lg bg-card h-fit">
      <TitleBlock title="Immagine del corso" icon={FileImage} />

      {isEditing ? (
        <div className="bg-muted p-4 mt-2 rounded-lg border-2 border-dashed border-border">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="course-image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="course-image-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Clicca per selezionare un&apos;immagine
                </p>
                <p className="text-xs text-muted-foreground">Max 4MB</p>
              </div>
            )}
          </label>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setIsEditing(false)}
            disabled={isUploading}
          >
            Annulla
          </Button>
        </div>
      ) : (
        <Image
          src={image || "/default-image-course.webp"}
          alt="Corso"
          className="w-full h-full rounded-md"
          width={500}
          height={250}
        />
      )}

      <Button
        className="w-full mt-4"
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(!isEditing)}
        disabled={isUploading}
      >
        <Pencil className="w-4 h-4" />
        Modifica immagine
      </Button>
    </div>
  );
}
