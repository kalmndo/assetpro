"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { type RouterOutputs, api } from "@/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteModal } from "@/components/delete-modal";
import { EditDialog } from "./edit-dialog";

const defaultValues = {
  id: "",
  name: ""
}

export function Table({
  data,
  departments
}: {
  data: RouterOutputs['kodeAnggaran']['getAll'],
  departments: RouterOutputs['department']['getSelect']
}) {
  const [dialog, setDialog] = useState<{ open: boolean | string, data: any }>({ open: false, data: defaultValues })
  const { mutateAsync, isPending } = api.departmentUnit.remove.useMutation()
  const router = useRouter()

  const onSubmit = async () => {
    try {
      const result = await mutateAsync({ id: dialog.data.id })
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
        columns={columns}
        filter={{ column: 'name', placeholder: 'Nama ...' }}
      // ini masalah di column
      // facetedFilter={[{ column: 'golongan', title: "Golongan", options: [{ label: 'Aset', value: "Aset" }] }]}
      />
      <DeleteModal
        open={dialog.open === 'delete'}
        onOpenChange={onOpenChange}
        dataName="KATEGORI"
        name={dialog.data.name}
        isPending={isPending}
        onSubmit={onSubmit}
      />
      <EditDialog
        departments={departments}
        open={dialog.open === 'edit'}
        value={dialog.data}
        onOpenChange={onOpenChange}
      />
    </div>
  )
}