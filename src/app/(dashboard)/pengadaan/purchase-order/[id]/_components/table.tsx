"use client"

import { DataTable } from "@/components/data-table";
import { type RouterOutputs } from "@/trpc/react";
import { columns } from "./columns";

const renderSubComponent = ({ row }: { row: any }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col space-y-2">
        <div >
          <p className="font-semibold">Catatan</p>
          <p className="text-sm">{row.original.catatan}</p>
        </div>
        <div >
          <p className="font-semibold">Termin pembayaran & waktu pengiriman</p>
          <p className="text-sm">{row.original.termin}</p>
        </div>
        <div >
          <p className="font-semibold">Garansi</p>
          <p className="text-sm">{row.original.garansi}</p>
        </div>
      </div>
    </div>
  )
}

export function Table({
  data,
}: {
  data: RouterOutputs['po']['get'],
}) {

  return (
    <div>
      <DataTable
        // @ts-ignore
        data={data.barang}
        columns={[
          ...columns,
        ]}
        isPagintation={false}
        getIsRowExpanded={() => true}
        getRowCanExpand={() => true}
        renderSubComponent={renderSubComponent}
      />
    </div>
  )
}