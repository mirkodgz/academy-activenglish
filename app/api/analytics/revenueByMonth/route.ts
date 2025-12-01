import { getRevenueByMonth } from "@/actions/getRevenueByMonth";
import { getUserId, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede ver analytics
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo i professori possono vedere le analitiche", {
        status: 403,
      });
    }

    // ADMIN ve analytics de todos los cursos (no solo los suyos)
    const data = await getRevenueByMonth(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[REVENUE_BY_MONTH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
