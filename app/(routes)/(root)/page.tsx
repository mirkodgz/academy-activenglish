import { getHomeCourses } from "@/actions/getHomeCourses";
import { ExploreCourses } from "./components";
import { ListCourses } from "@/components/Shared";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Verificar sesión - el middleware ya redirige, pero esto es una capa extra de seguridad
  const session = await auth();
  
  if (!session) {
    redirect("/sign-in");
  }

  const listCourses = await getHomeCourses();

  return (
    <div>
      <ExploreCourses />

      <ListCourses title="Corsi Top" courses={listCourses || []} />
    </div>
  );
}
