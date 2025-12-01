import { Course } from "@prisma/client";

export type CourseWithCreator = Course & {
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

export type CourseCardProps = {
  course: CourseWithCreator;
};
