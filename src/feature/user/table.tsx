"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { DataTableRowActions } from "@/components/data-table/row-actions";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DeleteModal } from "@/components/delete-modal";
import { EditDialog } from "./edit-dialog";

const defaultValues = {
  id: "",
  name: ""
}

export function Table({ data, modalData }: { data: any, modalData: any }) {
  const [dialog, setDialog] = useState<{ open: boolean | string, data: any }>({ open: false, data: defaultValues })
  const { mutateAsync, isPending } = api.user.remove.useMutation()
  const router = useRouter()

  const onSubmit = async () => {
    try {
      const result = await mutateAsync({ id: dialog.data.id })
      setDialog({ open: false, data: defaultValues })
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }

  const onOpenChange = (_open: boolean) => {
    setDialog({ open: false, data: defaultValues })
  }

  return (
    <div>
      <DataTable
        data={data}
        filter={{ column: 'name', placeholder: 'Nama ...' }}
        columns={[
          ...columns,
          {
            id: 'actions',
            cell: ({ row }) => (
              <DataTableRowActions>
                <DropdownMenuItem onSelect={() => setDialog({ open: 'edit', data: row.original as any })}>Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDialog({ open: 'delete', data: row.original as any })}>Delete</DropdownMenuItem>
              </DataTableRowActions>
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]}
      />
      <DeleteModal
        open={dialog.open === 'delete'}
        onOpenChange={onOpenChange}
        dataName="USER"
        name={dialog.data.name}
        isPending={isPending}
        onSubmit={onSubmit}
      />
      <EditDialog
        open={dialog.open === 'edit'}
        data={modalData}
        value={dialog.data}
        onOpenChange={onOpenChange}
      />
    </div>
  )
}