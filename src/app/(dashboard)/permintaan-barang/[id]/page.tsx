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
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { Table } from "@/feature/shared/detail-internal-memo";
import { getInitials } from "@/lib/utils";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.permintaanBarang.get({ id });
  const uom = await api.mUom.getSelect();
  const { color, name: status } = getStatus(data.status);

  const modalData = {
    uom,
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/permintaan-barang">Permintaan Barang</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Internal Memo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">Internal Memo</h1>
        </div>
        <div className="">{/* <AddDialog data={modalData} /> */}</div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">
            {status}
          </div>
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
            {!data.perbaikan && (
              <div className="space-y-2">
                <p className="text-sm">Ruang</p>
                <p className="font-semibold">{data.ruang}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm">Perihal</p>
              <p className="text-sm">{data.perihal}</p>
            </div>
            {data.perbaikan && (
              <div className="space-y-2">
                <p className="text-sm">Form perbaikan</p>
                <Link
                  href={`/permintaan/perbaikan/${data.perbaikan.id}`}
                  className="col-span-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  {data.perbaikan.no}
                </Link>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm">Pemohon</p>
            <Avatar className="h-14 w-14">
              <AvatarImage src={data.pemohon.image} alt="@shadcn" />
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
          <Table data={data} modalData={modalData} />
        </div>
      </div>
    </div>
  );
}

