import { getLastPurchases } from "@/actions/getLastPurchases";
import { getCurrentUser } from "@/lib/auth-mock";
import { DataTable } from "./data-table";
import { columns, PurchaseWithCourse } from "./columns";

export async function Payments() {
  const user = await getCurrentUser(); // Mock para desarrollo

  // Validación removida para desarrollo frontend
  // TODO: Restaurar validación cuando se implemente autenticación real

  const lastPurchases = await getLastPurchases(user?.id || "mock-user-id-123");

  return (
    <div className="mx-auto my-10 w-full border shadow-md bg-white p-4 rounded-md">
      <DataTable
        columns={columns}
        data={lastPurchases as PurchaseWithCourse[]}
      />
    </div>
  );
}
