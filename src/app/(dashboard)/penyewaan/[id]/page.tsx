import { api } from "@/trpc/server";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatus } from "@/lib/status";
import { getInitials } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import formatDate from "@/lib/formatDate";
import ApproveDialog from "./_components/approve-dialog";
import SendToUserDialog from "./_components/send-to-user-dialog";
import ReceiveDialog from "./_components/receive-dialog";
import TableAset from "./_components/table-aset";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.peminjamanEksternal.get({ id });
  const { color, name: status } = getStatus(data.status);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/peminjaman">Sewa</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Permintaan Sewa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Form Permintaan Sewa
          </h1>
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">
            {status}
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Nomor</p>
              <p className="font-semibold">{data.no}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal</p>
              <p className="font-semibold">{data.tanggal}</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm">Pemohon</p>
            <Avatar className="h-14 w-14">
              <AvatarImage src={data.pemohon.image ?? ""} alt="@shadcn" />
              <AvatarFallback>{getInitials(data.pemohon.name)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{data.pemohon.name}</p>
            <div className="text-sm">
              <p>{data.pemohon.title}</p>
              <p>
                {data.pemohon.Department.name} -{" "}
                {data.pemohon.DepartmentUnit?.name}
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="p-4">
          <div className="grid grid-cols-3">
            <div className="col-span-1">
              <div className="mb-4 space-y-2">
                <p className="text-sm">Peminjam</p>
                <p className="font-semibold">{data.peminjam}</p>
              </div>
              <div className="mb-4 space-y-2">
                <p className="text-sm">Ruang</p>
                <p className="font-semibold">{data.item}</p>
              </div>
              <div className="mb-4 flex gap-10">
                <div className="space-y-2">
                  <p className="text-sm">Biaya</p>
                  <p className="font-semibold ">{data.biaya}</p>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="mb-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">Tanggal peminjaman</p>
                  <p className="font-semibold">{data.from}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">Tanggal pengembalian</p>
                  <p className="font-semibold">{data.to}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm">Peruntukaan</p>
            <p className="text-sm">{data.peruntukan}</p>
          </div>
          {data.asets.length > 0 && (
            <div className="mt-8 space-y-2">
              <p className="text-sm">Daftar aset yang di pinjam</p>
              <TableAset asets={data.asets} />
            </div>
          )}
        </div>
        <div className="p-4">
          {data.isCanApprove && (
            <div className="flex justify-end space-x-4">
              <ApproveDialog id={data.id} />
            </div>
          )}
          {data.isCanSendToUser && (
            <div className="flex justify-end space-x-4">
              <SendToUserDialog id={data.id} />
            </div>
          )}
          {data.isMalCanReceive && (
            <div className="flex justify-end space-x-4">
              <ReceiveDialog id={data.id} />
            </div>
          )}
        </div>
        <div className="p-4">
          {/* <Table data={data} modalData={modalData} /> */}
        </div>
        <div className="p-4">
          <p className="text-lg font-semibold">Riwayat</p>
          <div className="rounded-lg border p-4">
            <ScrollArea className="h-[400px]">
              <div className="mx-auto ml-4 w-full max-w-4xl">
                <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
                  <div className="grid gap-8">
                    {data.riwayat.map((v, i) => {
                      const { day, hours, minutes, monthName } = formatDate(
                        v.createdAt,
                      );
                      return (
                        <div key={i} className="relative grid gap-2 text-sm">
                          <div className="absolute left-0 top-1 z-10 aspect-square w-3 translate-x-[-29.5px] rounded-full bg-primary"></div>
                          <div className="font-medium">
                            {day}, {monthName} {hours}:{minutes} WIB
                          </div>
                          <div className="font-semibold">{v.desc}</div>
                          <div className="text-sm ">{v.catatan}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
