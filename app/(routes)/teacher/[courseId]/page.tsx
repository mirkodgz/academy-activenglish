import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import {
  ChaptersBlock,
  CourseForm,
  CourseImage,
  CoursePrice,
  HeaderCourse,
} from "./components";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return <p>Non hai i permessi per visualizzare questo corso. </p>;
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      userId: userId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return <p>Questo corso non esiste</p>;
  }

  return (
    <div className="m-6">
      <HeaderCourse idCourse={course.id} isPublished={course.isPublished} />

      <CourseForm course={course} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <CourseImage idCourse={course.id} imageCourse={course.imageUrl} />

        <CoursePrice idCourse={course.id} priceCourse={course.price} />
      </div>

      <ChaptersBlock idCourse={course.id} chapters={course.chapters} />
    </div>
  );
}
