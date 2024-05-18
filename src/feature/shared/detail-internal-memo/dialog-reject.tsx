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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation";

interface Props {
  id: string
  open: boolean
  onOpenChange(open: boolean): void
}

export const DialogReject = (
  {
    id,
    open,
    onOpenChange,
  }: Props
) => {
  const { mutateAsync, isPending } = api.permintaanBarang.reject.useMutation()
  const router = useRouter()
  const [value, setValue] = useState("")

  const onChange = (e: any) => {
    setValue(e.target.value)
  }


  const onSubmit = async () => {
    try {
      const result = await mutateAsync({
        id,
      })

      toast.success(result.message)
      router.refresh()
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
            Aksi ini tidak dapat dibatalkan. Apakah kamu yakin ingin menolak Internal Memo ini?
          </DialogDescription>
        </DialogHeader>
        <div className=" py-4">
          <Label htmlFor="catatan" className="text-right">
            Catatan
          </Label>
          <Input
            id="catatan"
            value={value}
            placeholder="Catatan"
            className="col-span-3"
            onChange={onChange}
          />
        </div>
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={isPending} onClick={onSubmit}>{isPending ? <LoaderCircle className="animate-spin" /> : 'Yakin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}