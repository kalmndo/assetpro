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
import { type RouterOutputs, api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePickerWithPresets } from "@/components/date-picker-with-preset";

export default function ChangeDate({
  id,
  open,
  onClose
}: {
  id: string,
  open: boolean;
  onClose(): void;
}) {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const { mutateAsync, isPending } = api.penawaranHarga.changeDate.useMutation()

  async function onSubmit() {
    try {
      const result = await mutateAsync({
        id,
        deadline: date!,
      })
      toast.success(result.message)
      router.refresh()
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Ubah tanggal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">Silahka isi tanggal batas waktu akhir vendor dapat mengisi harga penawaran?</p>
          <DatePickerWithPresets
            date={date}
            setDate={setDate}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            onClick={onSubmit}
            disabled={isPending || !date}
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