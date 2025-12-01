import prisma from "@/lib/prisma";

export async function getLastPurchases(userId: string, limit: number = 10) {
  const purchases = await prisma.purchase.findMany({
    where: {
      course: {
        userId: userId, // Solo cursos del profesor actual
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      course: {
        select: {
          title: true,
          slug: true,
          imageUrl: true,
          price: true,
        },
      },
    },
  });

  // Mock: Retornar emails mock para desarrollo
  // TODO: Reemplazar con sistema de autenticación real cuando se implemente
  const purchasesWithEmails = purchases.map((purchase) => {
    return {
      ...purchase,
      userEmail: `user-${purchase.userId.slice(-4)}@example.com`, // Email mock
    };
  });

  return purchasesWithEmails;
}
