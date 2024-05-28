import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { Table } from "./_components/table";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.permintaanPenawaran.get({ id })
  const { color, name: status } = getStatus(data.status)

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            Pengadaan
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/permintaan-penawaran">Permintaan Penawaran</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Permintaan Penawaran</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Permintaan Penawaran
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
              <p className="text-sm">Permintaan Pembelian</p>
              <Link href={`/pengadaan/permintaan-pembelian/${data.permintaanPembelian.id}`} className="col-span-2 text-blue-600 font-semibold text-xs hover:underline">
                {data.permintaanPembelian.no}
              </Link>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Table data={data} />
          {/* <div className="my-4 flex justify-end">
            {data.isApprove && <ApproveDialog id={data.id} />}
          </div> */}
        </div>
      </div>
    </div>
  )
}