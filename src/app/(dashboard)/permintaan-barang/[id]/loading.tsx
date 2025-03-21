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

export default function Page() {
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
          <Skeleton className="h-6 w-[100px]" />
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Nomor</p>
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal</p>
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Ruang</p>
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Perihal</p>
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm">Pemohon</p>

            <Skeleton className="h-14 w-14 rounded-full" />

            <Skeleton className="h-6 w-[100px]" />
            <div className="space-y-4 text-sm">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

