import { redirect } from "next/navigation";
import { getCurrentUser, isStudent, isAdmin } from "@/lib/auth";
import { ProfileViewWrapper } from "./components";

export const dynamic = 'force-dynamic';

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
      <ProfileViewWrapper 
        user={{
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }}
        userIsAdmin={userIsAdmin}
      />
    </div>
  );
}

