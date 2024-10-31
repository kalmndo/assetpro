"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { z } from "zod";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export const schema = z.object({
  id: z.string(),
  no: z.string(),
  barang: z.object({
    name: z.string(),
    image: z.string().nullable(),
  }),
  code: z.string(),
  kategori: z.string(),
  satuan: z.number(),
  pengguna: z.string(),
});

export type Schema = z.infer<typeof schema>;

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: "no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No Inventaris" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("no")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "barang",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Barang" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="h-12 w-12 rounded-sm">
              <AvatarImage
                src={row.original.barang.image ?? ""}
                alt="@shadcn"
              />
              <AvatarFallback>
                {getInitials(row.original.barang.name)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
              {row.original.barang.name}
            </span>
          </div>
        </Link>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Barang" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("code")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "kategori",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("kategori")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "satuan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Satuan" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("satuan")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "pengguna",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="pengguna" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("pengguna")}
          </span>
        </Link>
      );
    },
  },
];
