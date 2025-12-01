import { redirect } from "next/navigation";
import { getCurrentUser, isTeacher } from "@/lib/auth-mock";
import { Payments, SuscriptorsChart, TotalRevenue } from "./components";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const userIsTeacher = await isTeacher();

  // Verificar que el usuario es TEACHER
  if (!user || !userIsTeacher) {
    redirect("/");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0b3d4d]">Dashboard Analitico</h1>
        <p className="text-gray-600 mt-1">
          Visualizza le statistiche e le analisi dei tuoi corsi
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SuscriptorsChart />

        <TotalRevenue />
      </div>

      <Payments />
    </div>
  );
}
