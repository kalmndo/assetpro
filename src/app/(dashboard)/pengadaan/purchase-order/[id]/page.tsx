import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { Table } from "./_components/table";
import Print from "./_components/print";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.po.get({ id })
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
              <Link href="/pengadaan/purchase-order">Purchase Order</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Purchase Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Purchase Order
          </h1>
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">{status}</div>
          <Print />
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
              <p className="text-sm">Evaluasi Harga</p>
              <Link href={`/pengadaan/evaluasi-harga/${data.evaluasiId}`} className="col-span-2 text-blue-600 font-semibold text-xs hover:underline">
                {data.Evaluasi?.no}
              </Link>
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Vendor</p>
              <p className="font-semibold">{data.vendor.name}</p>
              <p className="text-sm">{data.vendor.email} | {data.vendor.nohp} | {data.vendor.whatsapp}</p>
              <p className="text-sm">{data.vendor.alamat}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Table data={data} />
        </div>
      </div>
    </div>
  )
}