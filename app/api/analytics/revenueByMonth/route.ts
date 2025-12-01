import { getRevenueByMonth } from "@/actions/getRevenueByMonth";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await getRevenueByMonth(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.log("[REVENUE_BY_MONTH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
