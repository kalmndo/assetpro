"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SendToUserDialog({
  id,
}: {
  id: string,
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.peminjamanEksternal.sendToUser.useMutation()

  async function onSubmit() {
    try {
      const result = await mutateAsync({ id })
      toast.success(result.message)
      router.refresh()
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Serahkan Ke Pemohon</Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Serhakan ke pemohon</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm">Apakah anda yakin untuk menyerahkan permintaan eksternal ini?</p>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ?
              <LoaderCircle className="animate-spin" />
              :
              "Yakin, Setuju"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}