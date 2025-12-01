import prisma from "@/lib/prisma";
import { subMonths, startOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";

export async function getSusbcriptorsByMonth(userId: string) {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const purchases = await prisma.purchase.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
      course: {
        userId: userId, // Solo cursos del profesor actual
      },
    },
    select: {
      createdAt: true,
    },
  });

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);

    return {
      month: format(date, "LLLL", { locale: es }),
      count: 0,
      date: format(date, "yyyy-MM"),
    };
  });

  purchases.forEach((purchase) => {
    const purhcaseMonth = format(purchase.createdAt, "yyyy-MM");
    const month = months.find((m) => m.date === purhcaseMonth);
    if (month) {
      month.count += 1;
    }
  });

  return months.map(({ month, count }) => ({
    month,
    users: count,
  }));
}
