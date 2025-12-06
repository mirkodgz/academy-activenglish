import { Chapter, Course, UserProgress } from "@prisma/client";

export type ProgressCourseProps = {
  userProgress: UserProgress[];
  chapterCourseId: string;
  infoCourse: Course & { chapters: Chapter[] };
  resources?: Array<{ url: string; name: string; type?: string; size?: number }> | null;
};
