import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;
  const coursePrice = session?.metadata?.price;

  const price = coursePrice ? Number(coursePrice.replace(",", ".")) : 0;

  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId || !coursePrice) {
      return new NextResponse("Webhook Error: Missing metadata", {
        status: 400,
      });
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!existingPurchase) {
      await prisma.purchase.create({
        data: {
          userId,
          courseId,
          price: price,
        },
      });
    } else {
      return new NextResponse(
        `Webhook Error: Unhandled event type ${event.type}`,
        { status: 200 }
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
