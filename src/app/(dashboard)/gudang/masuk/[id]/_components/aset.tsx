"use client"

import { DataTable } from "@/components/data-table";
import { type RouterOutputs } from "@/trpc/react";
import { columns } from "./columns";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { AsetDialog } from "./aset-dialog";

export default function Aset({ data }: { data: RouterOutputs['barangMasuk']['get']['aset'] }) {
  const [dialog, setDialog] = useState<{ open: boolean, data: string[] }>({ open: false, data: [] })

  const onOpenChange = () => {
    setDialog({ open: false, data: [] })
  }

  const onClick = (id: string) => () => {
    setDialog({ open: true, data: data.find((v) => v.id === id)!.no })
  }

  return (
    <>
      <DataTable
        data={data}
        columns={[
          ...columns,
          {
            id: 'inventaris',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='No Invetaris' />
            ),
            cell: ({ row }) => (
              <Button
                variant="outline"
                size="icon"
                onClick={onClick(row.original.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]}
        isPagintation={false}
      />
      <AsetDialog data={dialog.data} open={dialog.open} onOpenChange={onOpenChange} />
    </>
  )
}