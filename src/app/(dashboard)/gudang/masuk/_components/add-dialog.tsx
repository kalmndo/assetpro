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


export const AddDialog = () => {
  const { data } = api.barangMasuk.findByPo.useQuery()
  const router = useRouter()
  const { mutateAsync, isPending } = api.barangMasuk.create.useMutation()
  const [open, setOpen] = useState(false)

  async function onSubmit(values: any) {

    try {
      const result = await mutateAsync(values)
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Barang Masuk</DialogTitle>
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