"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { z } from "zod";

export const schema = z.object({
  name: z.string(),
});

export type Schema = z.infer<typeof schema>;

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
];
