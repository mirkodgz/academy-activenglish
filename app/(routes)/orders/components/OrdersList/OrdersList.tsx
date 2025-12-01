"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  // TableFooter, // Comentado - no se usa por ahora
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { OrderListProps } from "./OrdersList.types";
// import { formatPrice } from "@/lib/formatPrice"; // Comentado - no se usa por ahora
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function OrdersList(props: OrderListProps) {
  const { purchases, receipts } = props;

  // const totalPurchases = purchases.reduce((acc, purchase) => {
  //   const rawPrice = purchase.course.price?.replace(",", ".");
  //   const price =
  //     rawPrice && !isNaN(Number(rawPrice)) ? parseFloat(rawPrice) : 0;
  //   return acc + price;
  // }, 0); // Comentado - no se usa por ahora

  // const formattedTotal = formatPrice(totalPurchases.toString() || "0"); // Comentado - no se usa por ahora

  const downloadReceipt = (index: number) => {
    const receiptUrl = receipts[index].receiptUrl;

    if (receiptUrl) {
      window.open(receiptUrl, "_blank");
    } else {
      toast.error("Ricevuta non trovata");
    }
  };

  return (
    <Table className="my-6">
      <TableCaption>Elenco dei tuoi ultimi ordini</TableCaption>
      <TableHeader className="bg-slate-100">
        <TableRow>
          <TableHead className="w-[100px]">Data</TableHead>
          <TableHead>Corso</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead className="text-center">Ricevuta</TableHead>
          {/* Precio comentado - Por ahora no mostramos precios */}
          {/* <TableHead className="text-right">Prezzo</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase, index) => (
          <TableRow key={purchase.id}>
            <TableCell className="font-medium">
              {purchase.createdAtFormatted}
            </TableCell>

            <TableCell>{purchase.course.title}</TableCell>

            <TableCell>
              <span
                className="bg-[#60CB58]/20 text-[#0b3d4d] 
              py-1 px-2 rounded-md text-sm"
              >
                Pagato
              </span>
            </TableCell>
            <TableCell className="text-center">
              <Button variant="outline" onClick={() => downloadReceipt(index)}>
                Vedi ricevuta
                <ExternalLink className="w-4 h-4" />
              </Button>
            </TableCell>
            {/* Precio comentado - Por ahora no mostramos precios */}
            {/* <TableCell className="text-right">
              {formatPrice(purchase.course.price)}
            </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
      {/* Footer con total comentado - Por ahora no mostramos precios */}
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Totale speso</TableCell>
          <TableCell className="text-right">{formattedTotal}</TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  );
}
