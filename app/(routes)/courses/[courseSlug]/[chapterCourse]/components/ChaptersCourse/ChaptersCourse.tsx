import { ChaptersCourseProps } from "./ChaptersCourse.types";
import { ChaptersList } from "./ChaptersList";

export function ChaptersCourse(props: ChaptersCourseProps) {
  const { chapters, courseSlug, chapterCourse, userProgress } = props;

  return (
    <div
      className="bg-card p-4 rounded-lg shadow-md 
    border border-border h-fit"
    >
      <h2 className="text-2xl font-medium text-card-foreground mb-4">Moduli </h2>

      <ChaptersList
        chapters={chapters}
        courseSlug={courseSlug}
        currentChapter={chapterCourse}
        userProgress={userProgress}
      />
    </div>
  );
}
