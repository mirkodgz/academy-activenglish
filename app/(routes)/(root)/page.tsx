import { getHomeCourses } from "@/actions/getHomeCourses";
import { ExploreCourses } from "./components";
import { ListCourses } from "@/components/Shared";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Verificar sesión - el middleware ya redirige, pero esto es una capa extra de seguridad
  const session = await auth();
  
  // El middleware ya maneja la redirección, así que solo verificamos sin redirigir
  // para evitar loops de redirección
  if (!session) {
    // Si no hay sesión, el middleware ya debería haber redirigido
    // Pero por seguridad, redirigir sin callbackUrl para evitar loops
    redirect("/sign-in");
  }

  const listCourses = await getHomeCourses();

  return (
    <div>
      <ExploreCourses />

      <ListCourses title="I TUOI CORSI" courses={listCourses || []} />
    </div>
  );
}
