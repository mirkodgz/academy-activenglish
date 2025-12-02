"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import { ProgressCourseProps } from "./ProgressCourse.types";
import { toast } from "sonner";

export function ProgressCourse(props: ProgressCourseProps) {
  const { userProgress, chapterCourseId, infoCourse } = props;
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
        isCompleted ? "Capitolo completato 🎉" : "Capitolo non completato 😭"
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

      <div className="my-4 w-full">
        <Button
          className="w-full"
          onClick={() => handleViewChapters(!isCompleted)}
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? "Segna come non completato" : "Segna come completato"}
        </Button>
      </div>
    </div>
  );
}
