"use client"

import { DataTable } from "@/components/data-table";
import { type RouterOutputs } from "@/trpc/react";
import { columns } from "./columns";
import DialogSelectVendor from "./dialog-select-vendor";
import { DataTableRowActions } from "@/components/data-table/row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import ApproveDialog from "./approve-dialog";
import { STATUS } from "@/lib/status";

export function Table({
  data,
}: {
  data: RouterOutputs['po']['get'],
}) {

  return (
    <div>
      <DataTable
        data={data.barang}
        columns={[
          ...columns,
          // {
          //   id: 'actions',
          //   cell: ({ row }) => (
          //     <DataTableRowActions>
          //       <DropdownMenuItem onSelect={() => setDialog({ open: true, data: row.original })}>Pilih Vendor</DropdownMenuItem>
          //     </DataTableRowActions>
          //   ),
          //   enableSorting: false,
          //   enableHiding: false,
          // },
        ]}
        isPagintation={false}
      />
      {/* <DialogSelectVendor
        vendors={data.getVendors}
        open={dialog.open}
        data={{ id: dialog.data.id, name: dialog.data.name }}
        onOpenChange={handleCloseDialog}
        vendorIds={barang.filter((v) => v.id === dialog.data.id).flatMap((a) => a.vendorTerpilih)}
        setBarang={setBarang}
      />
      <div className="py-4 flex justify-end">
        {data.status === STATUS.MENUNGGU.id && <ApproveDialog
          id={data.id}
          barang={barang}
        />}
      </div> */}
    </div>
  )
}