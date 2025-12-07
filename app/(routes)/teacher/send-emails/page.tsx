import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { SendEmailForm } from "./components/SendEmailForm";

export const dynamic = 'force-dynamic';

export default async function SendEmailsPage() {
  const user = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  // Verificar que el usuario es ADMIN
  if (!user || !userIsAdmin) {
    redirect("/");
  }

  return (
    <div className="m-6 space-y-6">
      <SendEmailForm />
    </div>
  );
}


