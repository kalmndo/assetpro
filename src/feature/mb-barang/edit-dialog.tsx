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
    subKategoris: SelectProps[]
    subSubKategoris: SelectProps[]
    uoms: SelectProps[]
  },
  value: any
}

export const EditDialog = ({ open, onOpenChange, data, value }: Props) => {
  const router = useRouter()
  const { mutateAsync, isPending } = api.mbBarang.update.useMutation()

  async function onSubmit(values: any) {
    try {
      const golCode = data.golongans.find((v) => values.golonganId === v.value)
      const katCode = data.kategoris.find((v) => values.kategoriId === v.value)
      const subKatCode = data.subKategoris.find((v) => values.subKategoriId === v.value)
      const subSubKatCode = data.subSubKategoris.find((v) => values.subSubKategoriId === v.value)

      const classCode = `${golCode!.code}.${katCode!.code}.${subKatCode!.code}.${subSubKatCode!.code}`
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
      <DialogContent className="sm:max-w-3xl overflow-y-scroll max-h-[550px]">
        <DialogHeader>
          <DialogTitle>Ubah Barang</DialogTitle>
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