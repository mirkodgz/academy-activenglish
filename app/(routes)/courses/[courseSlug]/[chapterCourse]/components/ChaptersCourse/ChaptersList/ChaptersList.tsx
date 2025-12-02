import Link from "next/link";
import { ChaptersListProps } from "./ChaptersList.types";
import { Eye, Lock } from "lucide-react";

export function ChaptersList(props: ChaptersListProps) {
  const { chapters, courseSlug, currentChapter, userProgress } = props;

  if (!chapters) {
    return null;
  }

  return (
    <div className="grid gap-4">
      {chapters.map((chapter) => {
        const isCurrent = chapter.id === currentChapter;
        const isCompleted = userProgress?.some(
          (progress) =>
            progress.chapterId === chapter.id && progress.isCompleted
        );

        return (
          <Link
            href={`/courses/${courseSlug}/${chapter.id}`}
            key={chapter.id}
            className={`flex items-center justify-between
                 border-border rounded-md transition-all duration-300 
                 
                 ${
                   isCurrent
                     ? "bg-primary text-primary-foreground"
                     : "hover:bg-accent hover:shadow-lg"
                 }
                 `}
          >
            <div
              className="flex items-center gap-2 border shadow-md 
            w-full justify-between rounded-md p-2"
            >
              <span>{chapter.title}</span>
              {isCompleted ? (
                <Eye className="h-4 w-4 shrink-0" />
              ) : (
                <Lock className="h-4 w-4 shrink-0" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
