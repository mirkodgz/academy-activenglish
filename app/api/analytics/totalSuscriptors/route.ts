import { NextResponse } from "next/server";
import { getSusbcriptorsByMonth } from "@/actions/getSuscribersByMonth";
import { getAuth, isTeacher } from "@/lib/auth-mock";

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

    // TEACHER ve analytics de todos los cursos
    const data = await getSusbcriptorsByMonth(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[TOTAL_SUSCRIPTORS]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
