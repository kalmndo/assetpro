"use client"
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { RouterOutputs } from "@/trpc/react";
import { getStatus } from "@/lib/status";
import RejectDialog from "./reject-dialog";
import ApproveDialog from "./approve-dialog";
import SelectTeknisiDialog from "./select-teknisi-dialog";
import { SelectProps } from "@/lib/type";
import TeknisiTerimaDialog from "./teknisi-terima-dialog";
import TeknisiDoneDialog from "./teknisi-done-dialog";
import TeknisiUndoneDialog from "./teknisi-undone-dialog";
import TambahKomponenDialog from "./tambah-komponen-dialog";
import TableKomponen from "./table-komponen";

export default function Page({ data, teknisi }: { data: RouterOutputs['perbaikan']['get'], teknisi: SelectProps[] }) {
  const { color, name: status } = getStatus(data.status)

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
          <h1 className='text-2xl font-bold tracking-tight'>
            Permintaan perbaikan
          </h1>
        </div>
        <div className="">
          {/* <AddDialog data={modalData} /> */}
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">{status}</div>
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
            <Avatar className='w-14 h-14'>
              <AvatarImage src={data.pemohon.image ?? ''} alt="@shadcn" />
              <AvatarFallback>{getInitials(data.pemohon.name)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{data.pemohon.name}</p>
            <div className="text-sm">
              <p>{data.pemohon.title}</p>
              <p>{data.pemohon.department} - {data.pemohon.departmentUnit}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-lg border mb-5">
            <div className="flex-shrink-0 rounded-lg overflow-hidden w-full md:w-[200px] aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={!data.barang.image ? "https://generated.vusercontent.net/placeholder.svg" : data.barang.image}
                alt={data.barang.name}
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 grid gap-2">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{data.barang.name}</h3>
              </div>
              <p>No Inventaris: {data.barang.noInv}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.barang.deskripsi}
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm">Teknisi</p>
              <p className="font-semibold">{data.teknisi}</p>
            </div>

          </div>
          <div className="my-4">
            <div className="flex justify-between my-2 items-center">
              <p className="font-semibold text-lg">Komponen perbaikan</p>
              {data.isTeknisiCanDone &&
                <TambahKomponenDialog id={data.id} />
              }
            </div>
            <TableKomponen data={data.components} />
          </div>
          {data.isAtasanCanApprove &&
            <div className="flex justify-end space-x-4">
              <RejectDialog id={data.id} />
              <ApproveDialog id={data.id} />
            </div>
          }
          {data.isCanSelectTeknisi &&
            <div className="flex justify-end space-x-4">
              <SelectTeknisiDialog id={data.id} teknisis={teknisi} />
            </div>
          }
          {data.isTeknisiCanAccept &&
            <div className="flex justify-end space-x-4">
              <TeknisiTerimaDialog id={data.id} />
            </div>
          }
          {data.isTeknisiCanDone &&
            <div className="flex justify-end space-x-4">
              <TeknisiUndoneDialog id={data.id} />
              <TeknisiDoneDialog id={data.id} />
            </div>
          }
        </div>
      </div>
    </div>
  )
}