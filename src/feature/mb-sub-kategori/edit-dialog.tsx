"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import { Form } from "./form"
import { type SelectProps } from "@/lib/type"
import { toast } from "sonner"



interface Props {
  open: boolean
  onOpenChange(open: boolean): void
  data: {
    golongans: SelectProps[]
    kategoris: SelectProps[]
  },
  value: any
}

export const EditDialog = ({ open, onOpenChange, data, value }: Props) => {
  const router = useRouter()
  const { mutateAsync, isPending } = api.mbSubKategori.update.useMutation()

  async function onSubmit(values: any) {
    try {
      const golCode = data.golongans.find((v) => values.golonganId === v.value)
      const katCode = data.kategoris.find((v) => values.kategoriId === v.value)
      const classCode = `${golCode!.code}.${katCode!.code}`
      const result = await mutateAsync({ id: value.id, ...values, classCode })

      onOpenChange(open)
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ubah Kategori</DialogTitle>
        </DialogHeader>
        <Form
          data={data}
          isPending={isPending}
          onSubmit={onSubmit}
          isEdit
          value={value}
        />
      </DialogContent>
    </Dialog>
  )
}