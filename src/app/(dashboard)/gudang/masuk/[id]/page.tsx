import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { api } from "@/trpc/server";
import { STATUS, getStatus } from "@/lib/status";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import Aset from "./_components/aset";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.barangMasuk.get({ id })
  const { color, name: status } = getStatus(STATUS.MENUNGGU.id)

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/gudang">Gudang</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/gudang/masuk">Barang Masuk</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Barang Masuk</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Tanda Terima Barang
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
              <p className="text-sm">No Purchase order</p>
              <Link href={`/pengadaan/penawaran-harga/${data.Po.id}`} className="col-span-2 text-blue-600 font-semibold text-xs hover:underline">
                {data.Po.no}
              </Link>
            </div>
          </div>
        </div>
        <div className="p-4">
          {data.aset.length >= 1 &&
            <>
              <p className='font-semibold text-sm mb-2'>Aset</p>
              <Aset data={data.aset} />
            </>
          }
        </div>
        <div className="p-4">
          {
            data.persediaan.length >= 1 &&
            <>
              <p className="font-semibold text-sm mb-2">Persediaan</p>
              <DataTable
                data={data.persediaan}
                columns={columns}
                isPagintation={false}
              />
            </>
          }
        </div>
      </div>
    </div>
  )
}