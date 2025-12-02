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

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: courseId,
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
