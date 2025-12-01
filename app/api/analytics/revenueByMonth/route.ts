import { getRevenueByMonth } from "@/actions/getRevenueByMonth";
import { getAuth, isTeacher } from "@/lib/auth-mock";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await getAuth();
    const userIsTeacher = await isTeacher();

    // Solo TEACHER puede ver analytics
    if (!userId || !userIsTeacher) {
      return new NextResponse("Unauthorized - Solo i professori possono vedere le analitiche", {
        status: 403,
      });
    }

    // TEACHER ve analytics de todos los cursos (no solo los suyos)
    const data = await getRevenueByMonth(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[REVENUE_BY_MONTH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
