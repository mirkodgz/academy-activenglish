import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";

import { getCurrentUser, isStudent, isAdmin } from "@/lib/auth";

import { getUserReceipts } from "@/actions/getReceipStripe";
import { getUserPurchases } from "@/actions/getUserPurchases";

import { OrdersList } from "./components";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const userIsStudent = await isStudent();
  const userIsAdmin = await isAdmin();

  // Permitir acceso a STUDENT y ADMIN
  if (!user || (!userIsStudent && !userIsAdmin)) {
    redirect("/");
  }

  const purchases = await getUserPurchases(user.id);
  const receipts = await getUserReceipts(user.id);

  return (
    <div className="my-4 mx-6 border rounded-lg bg-card p-6">
      <div className="flex items-center mb-6 gap-1">
        <div className="p-2 rounded-full bg-primary">
          <ReceiptText className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-card-foreground">Tutti i miei ordini</h1>
      </div>

      <OrdersList purchases={purchases} receipts={receipts} />
    </div>
  );
}
