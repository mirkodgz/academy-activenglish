import { redirect } from "next/navigation";
import { getPurchasedCourses } from "@/actions/getPurchasedCourses";
import { getUserProgressByCourse } from "@/actions/getUserProgressByCourse";
import { getCurrentUser, isStudent, isTeacher } from "@/lib/auth-mock";
import { Award } from "lucide-react";
import { CoursesList } from "./components/CoursesList";
import prisma from "@/lib/prisma";
import { TeacherCertificatesList } from "./components/TeacherCertificatesList";

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  const userIsStudent = await isStudent();
  const userIsTeacher = await isTeacher();

  // Permitir acceso a STUDENT y TEACHER
  if (!user || (!userIsStudent && !userIsTeacher)) {
    redirect("/");
  }

  const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || 
    (userIsTeacher ? "Profesor" : "Estudiante");

  // Si es TEACHER, mostrar certificados de estudiantes
  if (userIsTeacher) {
    // Obtener todos los cursos del profesor
    const teacherCourses = await prisma.course.findMany({
      where: {
        userId: user.id,
      },
      include: {
        purchases: true,
      },
    });

    // Obtener estudiantes que completaron cursos (100% progreso)
    const completedCertificates = await Promise.all(
      teacherCourses.flatMap(async (course) => {
        const purchases = course.purchases;
        const completed = await Promise.all(
          purchases.map(async (purchase) => {
            const progress = await getUserProgressByCourse(purchase.userId, course.id);
            if (progress === 100) {
              // TODO: Obtener información real del usuario cuando se implemente la relación
              // Por ahora usamos datos mock
              return {
                courseId: course.id,
                courseTitle: course.title,
                courseImage: course.imageUrl,
                studentId: purchase.userId,
                studentName: `Estudiante ${purchase.userId.slice(-4)}`, // Mock
                studentEmail: `student-${purchase.userId.slice(-4)}@example.com`, // Mock
                completedAt: purchase.createdAt, // Usar fecha de compra como aproximación
              };
            }
            return null;
          })
        );
        return completed.filter(Boolean);
      })
    );

    const allCertificates = completedCertificates.flat().filter((cert): cert is NonNullable<typeof cert> => cert !== null);

    return (
      <div className="m-6 p-6 border bg-white rounded-md">
        <div className="flex items-center gap-1 mb-6">
          <div className="p-2 rounded-full bg-[#60CB58]">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Certificati degli studenti</h3>
            <p className="text-sm text-gray-500 mt-1">
              Visualizza e gestisci i certificati degli studenti che hanno completato i tuoi corsi
            </p>
          </div>
        </div>

        {allCertificates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Nessun certificato disponibile</p>
            <p className="text-sm">
              Gli studenti che completano i tuoi corsi appariranno qui.
            </p>
          </div>
        ) : (
          <TeacherCertificatesList certificates={allCertificates} />
        )}
      </div>
    );
  }

  // Para estudiantes, obtener sus cursos comprados
  const courses = await getPurchasedCourses();

  if (!courses || courses.length === 0) {
    return (
      <div className="m-6 p-6 border bg-white rounded-md">
        <div className="flex items-center gap-1 mb-4">
          <div className="p-2 rounded-full bg-[#0b3d4d]">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Certificati dei corsi</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Non hai ancora completato nessun corso per ottenere un certificato.</p>
        </div>
      </div>
    );
  }

  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const progress = await getUserProgressByCourse(user?.id || "mock-user-id-123", course.id);
      return { ...course, progress };
    })
  );
  return (
    <div className="m-6 p-6 border bg-white rounded-md">
      <div className="flex items-center gap-1 mb-4">
        <div className="p-2 rounded-full bg-[#0b3d4d]">
          <Award className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Certificati dei corsi</h3>
      </div>

      <CoursesList courses={coursesWithProgress} userName={userName} />
    </div>
  );
}
