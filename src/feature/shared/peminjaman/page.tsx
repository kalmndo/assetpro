"use client";

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
import { type RouterOutputs } from "@/trpc/react";
import ApproveDialog from "./approve-dialog";
import AtasanApproveDialog from "./atasan-approve-dialog";
import SendToUserDialog from "./send-to-user-dialog";
import UserReceiveDialog from "./user-receive-dialog";
import UserReturnDialog from "./user-return-dialog";
import ReceiveDialog from "./receive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import formatDate from "@/lib/formatDate";
import SelectAsetDialog from "./select-aset-dialog";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";

export default function Page({
  data,
}: {
  data: RouterOutputs["peminjaman"]["get"];
}) {
  const { color, name: status } = getStatus(data.status);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/peminjaman">Peminjaman</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Peminjaman</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Form Permintaan Peminjaman
          </h1>
        </div>
        <div className="">{/* <AddDialog data={modalData} /> */}</div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">
            {status}
          </div>
          <div>Print</div>
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
              <AvatarImage src={data.peminjam.image ?? ""} alt="@shadcn" />
              <AvatarFallback>{getInitials(data.peminjam.name)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{data.peminjam.name}</p>
            <div className="text-sm">
              <p>{data.peminjam.title}</p>
              <p>
                {data.peminjam.Department.name} -{" "}
                {data.peminjam.DepartmentUnit?.name}
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="p-4">
          <div className="grid grid-cols-3">
            <div className="col-span-1">
              <div className="mb-4 space-y-2">
                <p className="text-sm">Tipe</p>
                <p className="font-semibold">{data.tipe}</p>
              </div>
              <div className="mb-4 flex gap-10">
                <div className="space-y-2">
                  <p className="text-sm">{data.tipe}</p>
                  <p className="font-semibold">{data.item}</p>
                </div>
              </div>
              {data.tipe === "Barang" && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm">Jumlah</p>
                  <p className="font-semibold">{data.jumlah} Pcs</p>
                </div>
              )}
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
              <DataTable
                data={data.asets}
                columns={[
                  {
                    id: "no",
                    header: ({ column }) => (
                      <DataTableColumnHeader
                        column={column}
                        title="No Inventaris"
                      />
                    ),
                    cell: ({ row }) => {
                      return (
                        <div className={`flex items-center space-x-4`}>
                          <p className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                            {row.original.Aset.id}
                          </p>
                        </div>
                      );
                    },
                    enableSorting: false,
                    enableHiding: false,
                  },
                  {
                    id: "pengguna",
                    header: ({ column }) => (
                      <DataTableColumnHeader column={column} title="Pengguna" />
                    ),
                    cell: ({ row }) => {
                      return (
                        <div className="flex space-x-4">
                          <span
                            className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}
                          >
                            {row.original.Aset.Pengguna?.name}
                          </span>
                        </div>
                      );
                    },
                    enableSorting: false,
                    enableHiding: false,
                  },
                ]}
                isPagintation={false}
              />
            </div>
          )}
        </div>
        <div className="p-4">
          {data.isAtasanCanApprove && (
            <div className="flex justify-end space-x-4">
              <AtasanApproveDialog id={data.id} />
            </div>
          )}
          {data.isCanApprove && (
            <div className="flex justify-end space-x-4">
              {data.tipe === "Barang" ? (
                <SelectAsetDialog
                  id={data.id}
                  data={data.listAvailableAsets}
                  jumlah={data.jumlah!}
                />
              ) : (
                <ApproveDialog id={data.id} />
              )}
            </div>
          )}
          {data.isCanSendToUser && (
            <div className="flex justify-end space-x-4">
              <SendToUserDialog id={data.id} />
            </div>
          )}
          {data.isUserCanReceive && (
            <div className="flex justify-end space-x-4">
              <UserReceiveDialog id={data.id} />
            </div>
          )}
          {data.isUserCanReturn && (
            <div className="flex justify-end space-x-4">
              <UserReturnDialog id={data.id} />
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

