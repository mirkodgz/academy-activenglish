import { Chapter, Course } from "@prisma/client";

export type CourseFormProps = {
  course: CourseWithRelations;
};

type CourseWithRelations = Course & { chapters: Chapter[] };
