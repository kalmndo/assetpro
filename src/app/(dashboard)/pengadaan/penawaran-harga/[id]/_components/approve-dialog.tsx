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

export default function ApproveDialog({
  id,
  barang
}: {
  id: string,
  barang: RouterOutputs['penawaranHarga']['get']['barang']
}) {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.penawaranHarga.send.useMutation()


  async function onSubmit() {
    try {
      const result = await mutateAsync({
        id,
        deadline: date!,
        // @ts-ignore
        // ini karena qty string jadi number
        barang
      })
      toast.success(result.message)
      router.refresh()
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // function disabled() {
  //   let isDisabled = true
  //   const vendorTerpilihArr = barang.map((v) => v.vendorTerpilih)
  //   for (const v of vendorTerpilihArr) {
  //     isDisabled = v.length > 0 ? false : true
  //   }
  //   return isDisabled
  // }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Kirim Penawaran</Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Kirim penawaran ke vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">Silahka isi tanggal batas waktu akhir vendor dapat mengisi harga penawaran?</p>
          <DatePickerWithPresets date={date} setDate={setDate} />
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