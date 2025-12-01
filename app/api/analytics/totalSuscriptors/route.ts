import { NextResponse } from "next/server";
import { getSusbcriptorsByMonth } from "@/actions/getSuscribersByMonth";
import { getUserId, isAdmin } from "@/lib/auth";

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

    // ADMIN ve analytics de todos los cursos
    const data = await getSusbcriptorsByMonth(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[TOTAL_SUSCRIPTORS]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
