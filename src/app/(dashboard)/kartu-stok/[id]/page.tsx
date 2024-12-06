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
import { PergerakanStokChart } from "./_components/chart";
import Table from "./_components/table";
import TheCard from "./_components/card";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.kartuStok.get({ id });

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/kartu-stok">Kartu stok</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail kartu stok</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            {data.barang.name}
          </h1>
        </div>
        <div className="">{/* <AddDialog data={modalData} /> */}</div>
      </div>
      <TheCard data={data.card} />
      <div className="mt-4 rounded-sm border">
        <div className="flex justify-between p-4">
          {/* <div style={{ color }} className="font-semibold">{status}</div>
          <div>Print</div> */}
        </div>
        <Separator />

        <div className="flex flex-col items-start gap-6 p-4 md:flex-row">
          <div className="aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg md:w-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                data.barang.image
                  ? data.barang.image
                  : "https://generated.vusercontent.net/placeholder.svg"
              }
              alt={""}
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid flex-1 gap-2">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">{data.barang.name}</h3>
              <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {data.barang.code}
              </div>
            </div>
            <p className="font-semibold">
              {data.barang.jumlah} {data.barang.uom}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.barang.deskripsi}
            </p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xl font-semibold">Pergerakan stok</p>
          <PergerakanStokChart data={data.pergerakanStok} />
        </div>
        <div className="p-4">
          <Table data={data.riwayat} />
          {/* <Table data={data} modalData={modalData} /> */}
        </div>
      </div>
    </div>
  );
}

