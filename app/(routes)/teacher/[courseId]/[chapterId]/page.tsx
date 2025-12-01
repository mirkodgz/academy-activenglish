import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import { ChapterForm } from "./components";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;

  const { userId } = await auth();

  if (!userId) {
    return <p>Non hai i permessi per visualizzare questo capitolo. </p>;
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
