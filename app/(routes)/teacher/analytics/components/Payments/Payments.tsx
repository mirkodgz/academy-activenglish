import { getLastPurchases } from "@/actions/getLastPurchases";
import { currentUser } from "@clerk/nextjs/server";
import { DataTable } from "./data-table";
import { columns, PurchaseWithCourse } from "./columns";

export async function Payments() {
  const user = await currentUser();

  if (!user) {
    return <div>No autenticado</div>;
  }

  const lastPurchases = await getLastPurchases(user.id);

  return (
    <div className="mx-auto my-10 w-full border shadow-md bg-white p-4 rounded-md">
      <DataTable
        columns={columns}
        data={lastPurchases as PurchaseWithCourse[]}
      />
    </div>
  );
}
