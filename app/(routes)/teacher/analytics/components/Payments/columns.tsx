"use client";

import { ColumnDef } from "@tanstack/react-table";

export type PurchaseWithCourse = {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  course: {
    title: string;
    slug: string;
    imageUrl: string;
    price: string;
  };
};

export const columns: ColumnDef<PurchaseWithCourse>[] = [
  {
    accessorKey: "createdAtFormatted",
    header: "Data di acquisto",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt).toLocaleDateString("it-IT");
      return <div className="font-medium">{date}</div>;
    },
  },
  {
    accessorKey: "userEmail",
    header: "Cliente",
  },
  {
    accessorKey: "course.title",
    header: "Corso",
  },
  {
    accessorKey: "price",
    header: "Prezzo",
    cell: ({ row }) => {
      const price = row.original.price;
      return <div>{price}€</div>;
    },
  },
];
