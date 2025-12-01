import { NextResponse } from "next/server";
import { getSusbcriptorsByMonth } from "@/actions/getSuscribersByMonth";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await getSusbcriptorsByMonth(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[TOTAL_SUSCRIPTORS]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
