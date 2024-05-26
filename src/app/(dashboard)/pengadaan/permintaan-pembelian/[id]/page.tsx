import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { Table } from "./_components/table";
import ApproveDialog from "./_components/approve-dialog";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.permintaanPembelian.get({ id })
  console.log("data", data)

  const { name: status, color } = getStatus(data.status)


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
              <Link href="/permintaan-pembelian">Permintaan Pembelian</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Permintaan Pembelian</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Permintaan Pembelian Barang
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
              <p className="text-sm">Internal Memo</p>
              {/* <p className="text-sm">{data.perihal}</p> */}
            </div>
          </div>
          {/* <div className="space-y-4">
            <p className="text-sm">Pemohon</p>
            <Avatar className='w-14 h-14'>
              <AvatarImage src={data.pemohon.image} alt="@shadcn" />
              <AvatarFallback>{getInitials(data.pemohon.name)}</AvatarFallback>
            </Avatar> 
            <p className="font-semibold">{data.pemohon.name}</p>
            <div className="text-sm">
              <p>{data.pemohon.title}</p>
              <p>{data.pemohon.department} - {data.pemohon.departmentUnit}</p>
            </div>
          </div> */}
        </div>
        <div className="p-4">
          <Table data={data} />
          <div className="my-4 flex justify-end">
            {data.isApprove && <ApproveDialog id={data.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}