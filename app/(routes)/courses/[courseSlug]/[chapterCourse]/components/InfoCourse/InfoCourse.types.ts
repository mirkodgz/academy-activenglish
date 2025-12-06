import { Chapter, Course, UserProgress } from "@prisma/client";

export type InfoCourseProps = {
  infoCourse: Course & { chapters: Chapter[] };
  chapterCourseId: string;
  userProgress: UserProgress[];
  purchaseCourse: boolean;
  videoUrl: string | null | undefined;
  resources?: Array<{ url: string; name: string; type?: string; size?: number }> | null;
};
