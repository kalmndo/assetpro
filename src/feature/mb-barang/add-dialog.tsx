"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Form } from "./form"
import { toast } from "sonner"
import { type SelectProps } from "@/lib/type"

interface Props {
  data: {
    golongans: SelectProps[],
    kategoris: SelectProps[],
    subKategoris: SelectProps[],
    subSubKategoris: SelectProps[],
    uoms: SelectProps[]
  },
}

export const AddDialog = ({ data }: Props) => {
  const router = useRouter()
  const { mutateAsync, isPending } = api.mbBarang.create.useMutation()
  const [open, setOpen] = useState(false)

  async function onSubmit(values: any) {

    try {
      const golCode = data.golongans.find((v) => values.golonganId === v.value)
      const katCode = data.kategoris.find((v) => values.kategoriId === v.value)
      const subKatCode = data.subKategoris.find((v) => values.subKategoriId === v.value)
      const subSubKatCode = data.subSubKategoris.find((v) => values.subSubKategoriId === v.value)

      const classCode = `${golCode!.code}.${katCode!.code}.${subKatCode!.code}.${subSubKatCode!.code}`

      const result = await mutateAsync({ ...values, classCode })
      setOpen(false)
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild >
        <Button size="sm">
          <Plus size={18} className="mr-1" />
          Tambah
        </Button>

      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl overflow-y-scroll max-h-[550px]">
        <DialogHeader>
          <DialogTitle>Tambah Barang</DialogTitle>
        </DialogHeader>
        <Form
          data={data}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}