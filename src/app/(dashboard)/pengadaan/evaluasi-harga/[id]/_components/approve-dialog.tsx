"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const defaultData = {
  isCreatePo: false,
  message: '',
  nilai: 0,
  title: '',
  total: 0,
  button: '',
  currentUser: '',
  nextUser: '',
  nextUserId: ''
}

export default function ApproveDialog({
  id,
  barang
}: {
  id: string,
  barang: RouterOutputs['evaluasiHarga']['get']['barang']
}) {
  const router = useRouter()
  const [dialog, setDialog] = useState({ open: false, data: defaultData as RouterOutputs['evaluasiHarga']['checkEvaluasi'] })
  const { mutateAsync: check, isPending: checkPending } = api.evaluasiHarga.checkEvaluasi.useMutation()
  const { mutateAsync: send, isPending: sendPending } = api.evaluasiHarga.send.useMutation()


  async function onSubmit() {
    try {
      const result = await send({
        id,
        barangs: barang.map((v) => ({
          barangId: v.id,
          vendorId: v.vendorTerpilihId!
        }))
      })

      if (result.ok) {
        setDialog({ open: false, data: defaultData })
      }

      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function onCheckClicked() {
    try {
      const result = await check({
        ids: barang.map((v) => v.vendorTerpilihId!)
      })

      if (result) {
        setDialog({ open: true, data: result })
      }

    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleCloseDialog = () => {
    setDialog({ open: false, data: defaultData })
  }


  return (
    <Dialog open={dialog.open} onOpenChange={handleCloseDialog}>
      <Button
        onClick={onCheckClicked}
        size="lg"
        disabled={barang.some((v) => !v.vendorTerpilihId) || checkPending}
      >
        {checkPending
          ? <LoaderCircle className="animate-spin" />
          : "Submit Evaluasi"
        }
      </Button>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>{dialog.data.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">Nilai evalusi : Rp {dialog.data.nilai.toLocaleString("id-ID")}</p>
          <p className="text-sm">Total harga : Rp {dialog.data.total.toLocaleString("id-ID")}</p>

          <p className="text-sm">{dialog.data.message}</p>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            onClick={onSubmit}
            disabled={sendPending}
          >
            {sendPending ?
              <LoaderCircle className="animate-spin" />
              : dialog.data.button
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}