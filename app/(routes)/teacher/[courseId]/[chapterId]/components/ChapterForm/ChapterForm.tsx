"use client";
import { ArrowLeft, Cog, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { ChapterFormProps } from "./ChapterForm.types";
import { TitleBlock } from "../../../components";
import axios from "axios";
import { toast } from "sonner";
import { ChapterTitleForm } from "./ChapterTitleForm";
import { ChapterAttachmentForm } from "./ChapterAttachmentForm";

// Función helper para parsear recursos desde Prisma JSON
function parseChapterResources(resources: unknown): Array<{ url: string; name: string; type?: string; size?: number }> | null {
  if (!resources) return null;
  
  // Si ya es un array, devolverlo
  if (Array.isArray(resources)) {
    return resources;
  }
  
  // Si es un string JSON, parsearlo
  if (typeof resources === 'string') {
    try {
      const parsed = JSON.parse(resources);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.error("Error parsing resources JSON:", e);
      return null;
    }
  }
  
  // Si es un objeto, intentar convertirlo a array
  if (typeof resources === 'object') {
    return Array.isArray(resources) ? resources : null;
  }
  
  return null;
}

export function ChapterForm(props: ChapterFormProps) {
  const { chapter, courseId } = props;

  const router = useRouter();

  if (!chapter) {
    return null;
  }

  // Parsear recursos desde Prisma JSON
  // Prisma devuelve resources como Json | null, necesitamos hacer un cast
  // El tipo Json de Prisma puede ser: string | number | boolean | null | JsonObject | JsonArray
  const chapterWithResources = chapter as typeof chapter & { resources?: unknown };
  
  // Verificar si el campo resources existe
  const chapterKeys = Object.keys(chapter);
  console.log("📦 ChapterForm - Chapter keys:", chapterKeys);
  console.log("📦 ChapterForm - Has 'resources' key:", 'resources' in chapter);
  console.log("📦 ChapterForm - Raw chapter object (full):", JSON.stringify(chapter, null, 2));
  console.log("📦 ChapterForm - Raw resources from Prisma:", chapterWithResources.resources);
  console.log("📦 ChapterForm - Resources type:", typeof chapterWithResources.resources);
  console.log("📦 ChapterForm - Resources isArray:", Array.isArray(chapterWithResources.resources));
  console.log("📦 ChapterForm - Resources stringified:", JSON.stringify(chapterWithResources.resources));
  console.log("📦 ChapterForm - Resources undefined check:", chapterWithResources.resources === undefined);
  console.log("📦 ChapterForm - Resources null check:", chapterWithResources.resources === null);
  
  const parsedResources = parseChapterResources(chapterWithResources.resources);
  console.log("✅ ChapterForm - Parsed resources:", parsedResources);

  const onPublish = async (state: boolean) => {
    try {
      axios.patch(`/api/course/${courseId}/chapter/${chapter.id}`, {
        isPublished: state,
      });

      toast(state ? "Modulo pubblicato 🔥" : "Modulo nascosto ✌🏽");

      router.refresh();
    } catch (error) {
      console.log(error);

      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  const removeChapter = async () => {
    axios.delete(`/api/course/${courseId}/chapter/${chapter.id}`);

    router.push(`/teacher/${courseId}`);

    toast("Modulo eliminato 🔥");
  };

  return (
    <div>
      <div className="p-6 bg-card rounded-md">
        <Button
          className="mb-4"
          variant="outline"
          onClick={() => router.push(`/teacher/${courseId}`)}
        >
          <ArrowLeft />
          Torna alla modifica del corso
        </Button>
      </div>

      <div className="p-6 mt-6 bg-card rounded-md flex justify-between items-center">
        <TitleBlock title="Configurazione del modulo" icon={Cog} />

        <div className="gap-2 flex items-center">
          {chapter.isPublished ? (
            <Button variant="outline" onClick={() => onPublish(false)}>
              Nascondi
            </Button>
          ) : (
            <Button onClick={() => onPublish(true)}>Pubblica</Button>
          )}

          <Button variant="destructive" onClick={removeChapter}>
            <Trash />
          </Button>
        </div>
      </div>

      <ChapterTitleForm courseId={courseId} chapter={chapter} />

      <ChapterAttachmentForm
        chapterId={chapter.id}
        courseId={courseId}
        videoUrl={chapter.videoUrl}
        documentUrl={chapter.documentUrl}
        imageUrl={chapter.imageUrl}
        resources={parsedResources}
      />
    </div>
  );
}
