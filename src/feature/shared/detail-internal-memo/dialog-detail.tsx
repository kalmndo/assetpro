"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import formatDate from "@/lib/formatDate";
import { getStatus } from "@/lib/status";
import { getInitials } from "@/lib/utils";

export default function DialogDetail({
  open,
  data,
  onOpenChange,
}: {
  open: boolean;
  data: any;
  onOpenChange(): void;
}) {
  const { color, name: status } = getStatus(data.status);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail</DialogTitle>
        </DialogHeader>
        <div className="">
          <p style={{ color }} className="pb-4 text-sm font-semibold">
            {status}
          </p>
          <Tabs defaultValue="account" className="">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="persetujuan">Persetujuan</TabsTrigger>
              <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 rounded-sm">
                    <AvatarImage src={data.image} alt="@shadcn" />
                    <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
                  </Avatar>
                  <div className="block">
                    <p className="text-sm font-medium">{data.name}</p>
                    <p className="text-sm font-medium">{data.kode}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-sm">
                    Permintaan {data.jumlah} {data.uom.name}
                  </p>
                  <p className="text-sm">Diterima 0 PCS</p>
                </div>
              </div>
              <Separator className="my-2" />
              <p className="text-sm font-semibold">Deskripsi</p>
              <div dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
              <Separator className="my-2" />
              <p className="text-sm font-semibold">Kode Anggaran</p>
              {data.kodeAnggaran?.map((v: string) => (
                <p key={v} className="text-sm">
                  - {v}
                </p>
              ))}
            </TabsContent>
            <TabsContent value="persetujuan">
              <div className="mx-auto w-full max-w-4xl ">
                <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
                  <div className="grid gap-8">
                    {data.persetujuan?.map((v: any) => (
                      <div
                        className="relative grid gap-2 text-sm"
                        key={v.id}
                        dangerouslySetInnerHTML={{ __html: v.desc }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="riwayat">
              <ScrollArea className="h-[400px]">
                <div className="mx-auto ml-4 w-full max-w-4xl">
                  <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
                    <div className="grid gap-8">
                      {data.riwayat?.[0]?.histories?.map(
                        (v: any, i: number) => {
                          const { day, hours, minutes, monthName } = formatDate(
                            v.createdAt,
                          );
                          return (
                            <div
                              key={i}
                              className="relative grid gap-2 text-sm"
                            >
                              <div className="absolute left-0 top-1 z-10 aspect-square w-3 translate-x-[-29.5px] rounded-full bg-primary"></div>
                              <div className="font-medium">
                                {day}, {monthName} {hours}:{minutes} WIB
                              </div>
                              <div className="font-semibold">{v.desc}</div>
                              <div className="text-sm text-blue-700">
                                {v.formNo}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

