import { redirect } from "next/navigation";
import { getCurrentUser, isStudent, isAdmin } from "@/lib/auth";
import { User, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const userIsStudent = await isStudent();
  const userIsAdmin = await isAdmin();

  // Permitir acceso a STUDENT y ADMIN
  if (!user || (!userIsStudent && !userIsAdmin)) {
    redirect("/");
  }

  return (
    <div className="my-4 mx-6 max-w-4xl">
      <Card className="border rounded-lg bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${
              userIsAdmin ? "bg-[#60CB58]" : "bg-[#0b3d4d]"
            }`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className={`text-2xl ${
                userIsAdmin ? "text-[#60CB58]" : "text-[#0b3d4d]"
              }`}>
                Il mio profilo
              </CardTitle>
              <CardDescription>Gestisci le tue informazioni personali</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Nome completo</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {user.firstName || ""} {user.lastName || ""}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {user.emailAddresses[0]?.emailAddress || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Ruolo</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-md font-semibold text-sm ${
                userIsAdmin 
                  ? "bg-[#60CB58]/10 text-[#60CB58]" 
                  : "bg-[#0b3d4d]/10 text-[#0b3d4d]"
              }`}>
                {userIsAdmin ? "Admin" : "Studente"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              ⚠️ Questa è una versión de desarrollo. Le funzionalità di modifica del profilo
              saranno disponibili quando si implementi il sistema di autenticazione reale.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

