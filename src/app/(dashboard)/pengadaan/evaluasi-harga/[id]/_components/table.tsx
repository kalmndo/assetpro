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
  data: RouterOutputs['evaluasiHarga']['get'],
}) {
  const [barang, setBarang] = useState(data.barang)
  const [dialog, setDialog] = useState({ open: false, data: {} as any })

  const handleCloseDialog = () => {
    setDialog({ open: false, data: {} })
  }

  return (
    <div>
      <DataTable
        data={barang as any}
        columns={[
          ...columns,
          {
            id: 'actions',
            cell: ({ row }) => (
              <DataTableRowActions>
                <DropdownMenuItem onSelect={() => setDialog({ open: true, data: row.original })}>Pilih Vendor</DropdownMenuItem>
              </DataTableRowActions>
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]}
        isPagintation={false}
      />
      <DialogSelectVendor
        open={dialog.open}
        data={dialog.data}
        onOpenChange={handleCloseDialog}
        setBarang={setBarang as any}
      />
      <div className="py-4 flex justify-end">
        {data.canApprove && <ApproveDialog
          id={data.id}
          barang={barang}
        />}
      </div>
    </div>
  )
}