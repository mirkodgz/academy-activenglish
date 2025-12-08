"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Download, FileText } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import { ProgressCourseProps } from "./ProgressCourse.types";
import { toast } from "sonner";

export function ProgressCourse(props: ProgressCourseProps) {
  const { userProgress, chapterCourseId, infoCourse, resources } = props;
  const { id, slug, chapters } = infoCourse;

  const [isCompleted, setIsCompleted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const progress = userProgress.find(
      (progress) => progress.chapterId === chapterCourseId
    );

    if (progress) {
      setIsCompleted(progress.isCompleted);
    }
  }, [chapterCourseId, userProgress]);

  const handleViewChapters = async (isCompleted: boolean) => {
    try {
      await axios.patch(
        `/api/course/${id}/chapter/${chapterCourseId}/progress`,
        JSON.stringify({ isCompleted })
      );

      toast(
        isCompleted ? "Modulo completato 🎉" : "Modulo non completato 😭"
      );

      if (isCompleted) {
        const currentIndex = chapters.findIndex(
          (chapter) => chapter.id === chapterCourseId
        );

        const nextChapter = chapters[currentIndex + 1];

        if (nextChapter) {
          router.push(`/courses/${slug}/${nextChapter.id}`);
        }
      }

      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((chapter) =>
    userProgress.some(
      (progress) => progress.chapterId === chapter.id && progress.isCompleted
    )
  ).length;

  const progressPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  return (
    <div>
      <div
        className="my-4 w-full flex items-center gap-2 flex-col p-2 border 
    rounded-md shadow-md bg-card"
      >
        <span className="text-sm">
          Progresso del corso | {progressPercentage}%
        </span>
        <Progress value={progressPercentage} className="[&>*]:bg-[#60CB58]" />
      </div>

      <div className="my-4 w-full flex justify-center">
        <Button
          size="sm"
          onClick={() => handleViewChapters(!isCompleted)}
          variant={isCompleted ? "outline" : "default"}
          className="text-sm"
        >
          {isCompleted ? "Segna come non completato" : "Segna come completato"}
        </Button>
      </div>

      {/* Sección de recursos del módulo */}
      {resources && resources.length > 0 && (
        <div className="my-4 w-full flex justify-center">
          <div className="flex flex-col items-center gap-3 p-4 border rounded-md bg-muted/50 hover:bg-muted transition-colors w-full max-w-md">
            <div className="flex items-center gap-2 text-primary">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Scarica risorse del modulo</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center w-full">
              {resources.map((resource, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <a
                    href={resource.url}
                    download={resource.name || "download"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{resource.name}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
