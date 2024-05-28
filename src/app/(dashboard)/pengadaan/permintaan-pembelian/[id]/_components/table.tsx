"use client"

import { DataTable } from "@/components/data-table";
import { type RouterOutputs } from "@/trpc/react";

import { columns } from "./columns";

export function Table({
  data,
}: {
  data: RouterOutputs['permintaanPembelian']['get'],
}) {
  return (
    <div>
      <DataTable
        data={data.barang as any}
        columns={columns}
        isPagintation={false}
      />
    </div>
  )
}