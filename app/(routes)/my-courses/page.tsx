import { redirect } from "next/navigation";
import { getPurchasedCourses } from "@/actions/getPurchasedCourses";
import { ListCourses } from "@/components/Shared";
import { getCurrentUser, isStudent } from "@/lib/auth";
import { BookOpen } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  const userIsStudent = await isStudent();

  // Verificar que el usuario es STUDENT
  if (!user || !userIsStudent) {
    redirect("/");
  }

  const courses = await getPurchasedCourses();

  if (!courses || courses.length === 0) {
    return (
      <div className="my-4 mx-6 border rounded-lg bg-white p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-[#0b3d4d]/10">
            <BookOpen className="w-12 h-12 text-[#0b3d4d]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nessun corso disponibile
            </h3>
            <p className="text-gray-500 max-w-md">
              Non ci sono corsi disponibili al momento. Torna più tardi per vedere i nuovi corsi!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ListCourses title="Tutti i corsi disponibili" courses={courses} />
    </div>
  );
}
