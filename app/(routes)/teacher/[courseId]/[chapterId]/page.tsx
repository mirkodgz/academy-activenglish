import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";

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
  const userIsAdmin = await isAdmin();

  // Verificar que el usuario es ADMIN
  if (!user || !userIsAdmin) {
    redirect("/");
  }

  // Hacer un select explícito para asegurar que resources se incluya
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      documentUrl: true,
      imageUrl: true,
      resources: true, // Incluir explícitamente resources
      position: true,
      isPublished: true,
      isFree: true,
      courseId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!chapter) {
    return <p>Questo modulo non esiste</p>;
  }

  return (
    <div className="m-6">
      <ChapterForm chapter={chapter} courseId={courseId} />
    </div>
  );
}
