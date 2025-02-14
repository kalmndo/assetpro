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
     footer: ({ table }) => {
     
      return `Total`
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
    accessorKey: "masaManfaat",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Masa Manfaat" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("masaManfaat")} Tahun
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "harga",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga Perolehan" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("harga")}
          </span>
        </Link>
      );
    },
    footer: ({ table }) => {
      const res = table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.hargaNum, 0)
      return `Rp ${res.toLocaleString("id-ID")}`
    },
  },
  {
    accessorKey: "susut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Penyusutan" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("susut")}
          </span>
        </Link>
      );
    },
    footer: ({ table }) => {
      const res = table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.susutNum, 0)
      return `Rp ${res.toLocaleString("id-ID")}`
    },
  },
  {
    accessorKey: "nilaiBuku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nilai Buku" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("nilaiBuku")}
          </span>
        </Link>
      );
    },
    footer: ({ table }) => {
      const res = table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.nilaiBukuNum, 0)
      return `Rp ${res.toLocaleString("id-ID")}`
    },
  },
  {
    accessorKey: "lokasi",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="lokasi" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("lokasi")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "kondisi",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kondisi" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("kondisi")}
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
  {
    accessorKey: "tahun",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tahun" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("tahun")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "org",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit Usaha" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`daftar-aset/${row.original.id.replace(/\//g, "-")}`}
          className="flex w-full"
        >
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("org")}
          </span>
        </Link>
      );
    },
    enableHiding: true
  },
];
