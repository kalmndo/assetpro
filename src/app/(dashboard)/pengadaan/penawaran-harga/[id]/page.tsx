import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { Table } from "./_components/table";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.penawaranHarga.get({ id })
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
              <Link href="/penawaran-harga">Penawaran Harga</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Penawaran Harga</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Penawaran Harga
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
          <div className="col-span-1 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Nomor</p>
              <p className="font-semibold">{data.no}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal</p>
              <p className="font-semibold">{data.tanggal}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Permintaan Penawaran</p>
              <Link href={`/pengadaan/permintaan-penawaran/${data.permintaanPenawaran.id}`} className="col-span-2 text-blue-600 font-semibold text-xs hover:underline">
                {data.permintaanPenawaran.no}
              </Link>
            </div>
          </div>
          <div className="col-span-1 space-y-4">
            {data.deadline
              ?
              <div className="space-y-2">
                <p className="text-sm">Batas waktu vendor respon penawaran harga</p>
                <p className="font-semibold">{data.penawaranDeadline}</p>
              </div>
              :
              <div className="space-y-2">
                <p className="text-sm">Kirim penawaran harga pada</p>
                <p className="font-semibold">{data.penawaranDeadline}</p>
              </div>
            }
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