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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";


export default function InputHargaDialog({
  id,
  files
}: {
  id: string,
  files: {
    id: string,
    name: string,
    type: string,
    size: number,
    url: string
  }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.perbaikanEksternal.inputHarga.useMutation()


  async function onSubmit() {
    try {
      const result = await mutateAsync({ id, files })
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
        <Button size="lg">Input harga</Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Input harga</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm">Apakah anda yakin menginput harga penawaran ini?</p>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ?
              <LoaderCircle className="animate-spin" />
              :
              "Yakin"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}