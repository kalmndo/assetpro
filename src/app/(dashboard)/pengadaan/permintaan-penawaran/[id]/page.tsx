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
import { api } from "@/trpc/server";
import { getStatus, STATUS } from "@/lib/status";
import { Table } from "./_components/table";
import Menu from "./_components/menu";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.permintaanPenawaran.get({ id });
  const { color, name: status } = getStatus(data.status);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Pengadaan</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/pengadaan/permintaan-penawaran">
                Permintaan Penawaran
              </Link>
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
          <h1 className="text-2xl font-bold tracking-tight">
            Form Permintaan Penawaran
          </h1>
        </div>
        <div className=""></div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">
            {status}
          </div>
          {data.status !== STATUS.MENUNGGU.id && (
            <Menu vendors={data.unsendVendors} id={data.id} />
          )}
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
              <p className="text-sm">Permintaan Pembelian</p>
              <Link
                href={`/pengadaan/permintaan-pembelian/${data.permintaanPembelian.id}`}
                className="col-span-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                {data.permintaanPembelian.no}
              </Link>
            </div>
          </div>
          <div className="col-span-1 space-y-4">
            {data.deadline && (
              <div className="space-y-2">
                <p className="text-sm">
                  Batas waktu vendor kirim harga penawaran
                </p>
                <p className="font-semibold">{data.deadline}</p>
              </div>
            )}
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
  );
}
