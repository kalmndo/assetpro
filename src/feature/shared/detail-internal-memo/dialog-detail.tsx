"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStatus } from "@/lib/status"
import { getInitials } from "@/lib/utils"

export default function DialogDetail({
  open,
  data,
  onOpenChange
}: {
  open: boolean,
  data: any,
  onOpenChange(): void
}) {
  const { color, name: status } = getStatus(data.status)
  console.log("data", data)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Detail
          </DialogTitle>
        </DialogHeader>
        <div className="">
          <p style={{ color }} className="text-sm font-semibold pb-4">{status}</p>
          <Tabs defaultValue="account" className="">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="persetujuan">Persetujuan</TabsTrigger>
              <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
            </TabsList>
            <TabsContent value='detail'>
              <div className="flex justify-between">
                <div className="flex space-x-4 items-center">
                  <Avatar className='rounded-sm w-12 h-12'>
                    <AvatarImage src={data.image} alt="@shadcn" />
                    <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
                  </Avatar>
                  <div className='block'>
                    <p className='font-medium text-sm'>
                      {data.name}
                    </p>
                    <p className="font-medium text-sm">
                      {data.kode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-sm">Permintaan {data.jumlah} {data.uom.name}</p>
                  <p className="text-sm">Diterima 0 PCS</p>

                </div>
              </div>
              <Separator className="my-2" />
              <p className="font-semibold text-sm">Deskripsi</p>
              <p className="text-sm">{data.deskripsi}</p>
              <Separator className="my-2" />
              <p className="font-semibold text-sm">Kode Anggaran</p>
              {data.kodeAnggaran?.map((v: string) => (

                <p key={v} className="text-sm">- {v}</p>
              ))}
            </TabsContent>
            <TabsContent value='persetujuan'>
              <div className="w-full max-w-4xl mx-auto ">
                <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
                  <div className="grid gap-8">
                    {data.persetujuan?.map((v: any) => (
                      <div className="grid gap-2 text-sm relative" key={v.id} dangerouslySetInnerHTML={{ __html: v.desc }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}