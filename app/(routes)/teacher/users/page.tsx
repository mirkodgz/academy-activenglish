import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { CreateUserForm, UsersList } from "./components";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  // Verificar que el usuario es ADMIN
  if (!user || !userIsAdmin) {
    redirect("/");
  }

  return (
    <div className="m-6 space-y-6">
      <CreateUserForm />
      <UsersList />
    </div>
  );
}

