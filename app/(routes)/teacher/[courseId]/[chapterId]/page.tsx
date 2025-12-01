import { redirect } from "next/navigation";
import { getCurrentUser, isTeacher } from "@/lib/auth-mock";

import prisma from "@/lib/prisma";

import { ChapterForm } from "./components";

export const dynamic = 'force-dynamic';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;

  const user = await getCurrentUser();
  const userIsTeacher = await isTeacher();

  // Verificar que el usuario es TEACHER
  if (!user || !userIsTeacher) {
    redirect("/");
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
    },
  });

  if (!chapter) {
    return <p>Questo capitolo non esiste</p>;
  }

  return (
    <div className="m-6">
      <ChapterForm chapter={chapter} courseId={courseId} />
    </div>
  );
}
