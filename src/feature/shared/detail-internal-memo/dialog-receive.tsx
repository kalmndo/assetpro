"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoaderCircle } from "lucide-react"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation";

interface Props {
  id: string,
  barang: any
  open: boolean
  onOpenChange(): void
}

export const DialogReceive = (
  {
    id,
    barang,
    open,
    onOpenChange,
  }: Props
) => {
  const { mutateAsync, isPending } = api.permintaanBarang.receive.useMutation()
  const router = useRouter()
  const onSubmit = async () => {
    try {
      const result = await mutateAsync({
        permintaanBarangId: barang.id,
        barangId: barang.barangId,
        imId: id
      })

      toast.success(result.message)
      onOpenChange()
      location.reload()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apakah kamu yakin?</DialogTitle>
          <DialogDescription>
            Aksi ini tidak dapat dibatalkan. Apakah kamu yakin barang ini akan diterima?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='default'
            disabled={isPending} onClick={onSubmit}>{isPending ? <LoaderCircle className="animate-spin" /> : 'Yakin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}