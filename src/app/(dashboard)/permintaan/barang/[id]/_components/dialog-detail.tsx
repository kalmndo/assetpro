import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DialogDetail({
  open,
  onOpenChange
}: {
  open: boolean,
  onOpenChange(): void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Detail
          </DialogTitle>
        </DialogHeader>
        <div className=" py-4">
          <Tabs defaultValue="account" className="">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
              <TabsTrigger value="keluar">Keluar</TabsTrigger>
              <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
            </TabsList>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}