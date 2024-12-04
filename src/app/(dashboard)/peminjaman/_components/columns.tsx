"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { z } from "zod";
import Link from "next/link";
import { getStatus } from "@/lib/status";

export const schema = z.object({
  id: z.string(),
  no: z.string(),
  type: z.string(),
  nama: z.string(),
  peruntukan: z.string(),
  jadwalPinjam: z.string(),
  tanggal: z.string(),
  status: z.string(),
});

export type Schema = z.infer<typeof schema>;

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: "no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("no")}
          </span>
        </Link>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipe" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("type")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("nama")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "peruntukan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peruntukan" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("peruntukan")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "jadwalPinjam",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jadwal Pinjam" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("jadwalPinjam")}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { color, name } = getStatus(row.getValue("status"));
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span
            style={{ color }}
            className="max-w-32 truncate font-semibold sm:max-w-72 md:max-w-[31rem]"
          >
            {name}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "tanggal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`peminjaman/${row.original.id}`} className="flex w-full">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("tanggal")}
          </span>
        </Link>
      );
    },
  },
];
