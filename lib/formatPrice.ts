export const formatPrice = (price: string | null): string => {
  if (price === "Gratis" || price === "Gratuito") {
    return "Gratuito";
  }

  const priceNumber = price ? parseFloat(price.replace(",", ".")) : 0;

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(priceNumber);
};
