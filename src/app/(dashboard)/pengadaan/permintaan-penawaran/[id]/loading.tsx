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
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Pengadaan</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/permintaan-pembelian">Permintaan Penawaran</Link>
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
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <Skeleton className="h-6 w-[100px]" />
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Nomor</p>
              <Skeleton className="h-6 w-[200px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal</p>
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Internal Memo</p>
              {/* <p className="text-sm">{data.perihal}</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
