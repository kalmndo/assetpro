import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { Table } from "@/feature/shared/detail-internal-memo";
import { getInitials } from "@/lib/utils";
import ApproveDialog from "./_components/approve-dialog";
import RejectDialog from "./_components/reject-dialog";
import SelectTeknisiDialog from "../../../perbaikan/permintaan/[id]/_components/select-teknisi-dialog";
import { SelectProps } from "@/lib/type";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.perbaikan.get({ id })
  const { color, name: status } = getStatus(data.status)
  let teknisi: SelectProps[] = []
  if (data.isCanSelectTeknisi) {
    const res = await api.teknisi.getSelect()
    teknisi = res
  }

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
            <div className="space-y-2">
              <p className="text-sm">Teknisi</p>
              <p className="font-semibold">{data.teknisi}</p>
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
                {/* <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">{data.barang.kode}</div> */}
              </div>
              <p>No Inventaris: {data.barang.noInv}</p>
              {/* <p className="font-semibold">{barang.qty} {barang.uom}</p> */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.barang.deskripsi}
              </p>
            </div>
          </div>
          {/* <Table data={data} modalData={modalData} /> */}
          {data.isAtasanCanApprove &&
            <div className="flex justify-end space-x-4">
              <RejectDialog id={id} />
              <ApproveDialog id={id} />
            </div>
          }
          {data.isCanSelectTeknisi &&
            <div className="flex justify-end space-x-4">
              <SelectTeknisiDialog id={id} teknisis={teknisi} />
            </div>
          }
        </div>
      </div>
    </div>
  )
}