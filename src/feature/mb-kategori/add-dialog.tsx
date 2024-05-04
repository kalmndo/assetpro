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
import { type SelectProps } from "@/lib/type"
import { toast } from "sonner"

interface GolonganProps extends SelectProps {
  // Add more fields here
  code: number; // Example additional field
}

interface Props {
  data: {
    golongans: GolonganProps[]
  },
}

export const AddDialog = ({ data }: Props) => {
  const router = useRouter()
  const { mutateAsync, isPending } = api.mbKategori.create.useMutation()
  const [open, setOpen] = useState(false)

  async function onSubmit(values: any) {

    try {
      const golCode = data.golongans.find((v) => values.golonganId === v.value)
      const classCode = `${golCode!.code}`
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild >
        <Button size="sm">
          <Plus size={18} className="mr-1" />
          Tambah
        </Button>

      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
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