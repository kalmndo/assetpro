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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/daftar-aset">Daftar aset</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail daftar aset</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <Skeleton className="h-6 w-[100px]" />
        </div>

        <div className="">{/* <AddDialog data={modalData} /> */}</div>
      </div>
      {/* <Card data={data.card} /> */}

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {[
          "Nilai Aset",
          "Harga Pembelian",
          "Nilai Penyusutan",
          "Total Pembiayaan",
        ].map((v) => (
          <Card key={v} x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium">{v}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color: "green" }} className="font-semibold">
            Digunakan
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 space-y-4">
            <div className="flex flex-col items-start gap-6 md:flex-row ">
              <div className="aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg md:w-[200px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={"https://generated.vusercontent.net/placeholder.svg"}
                  alt={""}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid flex-1 gap-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-[200px]" />
                  <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"></div>
                </div>
                {/* <p className="font-semibold">{data.barang.jumlah} {data.barang.uom}</p> */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {/* {data.barang.desc} */}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm">Pengguna</p>

            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-6 w-[200px] " />
            <div className="space-y-4 text-sm">
              <Skeleton className="h-4 w-[100px] " />
              <Skeleton className="h-4 w-[100px] " />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <p className="mb-2 pl-4 font-semibold">Informasi Tambahan Aset</p>
            <div className="space-y-4 pl-4">
              <div className="space-y-2">
                <p className="text-sm">Garansi</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Lokasi</p>
              {/* <p className="font-semibold">{data.lokasi}</p> */}

              <Skeleton className="h-4 w-[100px] " />
            </div>
            <div className="space-y-2">
              <p className="text-sm">Peruntukan</p>
              <Skeleton className="h-4 w-[100px] " />
              {/* <p className="font-semibold">{data.peruntukan}</p> */}
            </div>
          </div>
        </div>
        <div className="p-4">
          <Separator className="mt-4" />
        </div>
      </div>
    </div>
  );
}
