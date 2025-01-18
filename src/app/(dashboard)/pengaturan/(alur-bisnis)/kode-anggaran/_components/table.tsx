"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { type RouterOutputs, api } from "@/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

const defaultValues = {
  id: "",
  name: ""
}

export function Table({
  data,
}: {
  data: RouterOutputs['kodeAnggaran']['getAll'],
}) {
  const [dialog, setDialog] = useState<{ open: boolean | string, data: any }>({ open: false, data: defaultValues })
  const { mutateAsync, isPending } = api.kodeAnggaran.delete.useMutation()
  const router = useRouter()

  const onSubmit = async () => {
    try {
      const result = await mutateAsync({ id: dialog.data.kode })
      toast.success(result.message)
      router.refresh()
      setDialog({ open: false, data: defaultValues })
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
        columns={[
          ...columns,
          {
            id: 'actions',
            cell: ({ row }) => (
              <div className="flex justify-end">
                <Button size={'icon'} variant={'ghost'} onClick={() => { setDialog({ open: 'delete', data: row.original }) }} >
                  <Trash size={16} />
                </Button>
              </div>
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]}
        filter={{ column: 'name', placeholder: 'Nama ...' }}
      />
      <DeleteModal
        open={dialog.open === 'delete'}
        onOpenChange={onOpenChange}
        dataName="KODE ANGGARAN"
        name={dialog.data.name}
        isPending={isPending}
        onSubmit={onSubmit}
      />
    </div>
  )
}