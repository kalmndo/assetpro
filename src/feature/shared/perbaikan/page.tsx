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
import { getInitials } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";
import { getStatus } from "@/lib/status";
import RejectDialog from "./reject-dialog";
import ApproveDialog from "./approve-dialog";
import SelectTeknisiDialog from "./select-teknisi-dialog";
import { type SelectProps } from "@/lib/type";
import TeknisiTerimaDialog from "./teknisi-terima-dialog";
import TeknisiDoneDialog from "./teknisi-done-dialog";
import TeknisiUndoneDialog from "./teknisi-undone-dialog";
import TambahKomponenDialog from "./tambah-komponen-dialog";
import TableKomponen from "./table-komponen";
import UserTerimaDialog from "./user-terima-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import formatDate from "@/lib/formatDate";

export default function Page({
  data,
  teknisi,
  imComponents,
  vendors,
}: {
  data: RouterOutputs["perbaikan"]["get"];
  teknisi: SelectProps[];
  vendors: SelectProps[];
  imComponents: RouterOutputs["perbaikan"]["getImConponents"];
}) {
  const { color, name: status } = getStatus(data.status);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/perbaikan">Permintaan Perbaikan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail permintaan perbaikan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Permintaan perbaikan
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
            <div className="space-y-2">
              <p className="text-sm">Keluhan</p>
              <p className="text-sm">{data.keluhan}</p>
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
                {data.pemohon.department} - {data.pemohon.departmentUnit}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-5 flex flex-col items-start gap-6 rounded-lg border p-6 md:flex-row">
            <div className="aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg md:w-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  !data.barang.image
                    ? "https://generated.vusercontent.net/placeholder.svg"
                    : data.barang.image
                }
                alt={data.barang.name}
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid flex-1 gap-2">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{data.barang.name}</h3>
              </div>
              <p>No Inventaris: {data.barang.noInv}</p>
              <p
                className="text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: data.barang.deskripsi }}
              />
            </div>
          </div>
          {data.teknisi && (
            <>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <p className="text-sm">Teknisi</p>
                  <p className="font-semibold">{data.teknisi}</p>
                </div>
              </div>
              <div className="my-4 flex justify-between">
                <div className="space-y-2">
                  <p className="text-sm">Catatan Teknisi</p>
                  <p className="text-sm">{data.catatanTeknisi}</p>
                </div>
              </div>
            </>
          )}
          <div className="my-4">
            <div className="my-2 flex items-center justify-between">
              <p className="text-lg font-semibold">Komponen perbaikan</p>
              {data.isTeknisiCanDone && (
                <TambahKomponenDialog
                  id={data.id}
                  imComponents={imComponents}
                />
              )}
            </div>
            <TableKomponen data={data.components} />
          </div>
          {data.isAtasanCanApprove && (
            <div className="flex justify-end space-x-4">
              <RejectDialog id={data.id} />
              <ApproveDialog id={data.id} />
            </div>
          )}
          {data.isCanSelectTeknisi && (
            <div className="flex justify-end space-x-4">
              <SelectTeknisiDialog id={data.id} teknisis={teknisi} />
            </div>
          )}
          {data.isTeknisiCanAccept && (
            <div className="flex justify-end space-x-4">
              <TeknisiTerimaDialog id={data.id} />
            </div>
          )}
          {data.isUserCanAccept && (
            <div className="flex justify-end space-x-4">
              <UserTerimaDialog id={data.id} />
            </div>
          )}
          {data.isTeknisiCanDone && (
            <div className="flex justify-end space-x-4">
              <TeknisiUndoneDialog id={data.id} vendors={vendors} />
              <TeknisiDoneDialog id={data.id} />
            </div>
          )}
          {data.isTeknisiCanDoneFromEks && (
            <div className="flex justify-end space-x-4">
              <TeknisiDoneDialog id={data.id} />
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-lg font-semibold">Riwayat</p>
          <div className="rounded-lg border p-4">
            <ScrollArea className="h-[400px]">
              <div className="mx-auto ml-4 w-full max-w-4xl">
                <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
                  <div className="grid gap-8">
                    {data.riwayat.map((v: any, i: number) => {
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
                          <div className="text-sm text-blue-700">
                            {v.formNo}
                          </div>
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

