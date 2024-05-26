"use client"

import { DataTable } from "@/components/data-table";
import { DataTableRowActions } from "@/components/data-table/row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";
import { type RouterOutputs } from "@/trpc/react";
import { useState } from "react";

import { columns } from "./columns";

export function Table({
  data,

}: {
  data: RouterOutputs['permintaanPembelian']['get'],
}) {
  const [barangs, setBarangs] = useState(data.barang)
  const [dialog, setDialog] = useState<{ open: boolean | string, data: any }>({ open: false, data: {} })


  const handleDialogClose = () => {
    setDialog({ open: false, data: {} })
  }

  return (
    <div>
      <DataTable
        data={barangs as any}
        columns={[
          ...columns,
          {
            id: 'actions',
            cell: ({ row }: { row: any }) => (
              <DataTableRowActions variant={'outline'}>
                <DropdownMenuItem className="space-x-4" onSelect={() => setDialog({ open: 'detail', data: row.original })}>
                  <Eye size={14} />
                  <p className="text-sm">Detail</p>
                </DropdownMenuItem>
              </DataTableRowActions>
            ),
            enableSorting: false,
            enableHiding: false,
          }
        ]}
        isPagintation={false}
      />

      {/* <DialogDetail
        open={dialog.open === 'detail'}
        onOpenChange={handleDialogClose}
      /> */}
    </div>
  )
}