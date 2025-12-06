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

export function ChapterForm(props: ChapterFormProps) {
  const { chapter, courseId } = props;

  const router = useRouter();

  if (!chapter) {
    return null;
  }

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
        resources={(chapter as typeof chapter & { resources?: Array<{ url: string; name: string; type?: string; size?: number }> | null }).resources}
      />
    </div>
  );
}
