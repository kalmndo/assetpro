import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import { getInitials } from "@/lib/utils";
import { PergerakanStokChart } from "./_components/chart"
import Table from "./_components/table";
import TheCard from "./_components/card";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.kartuStok.get({ id })

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/permintaan-barang">Kartu stok</Link>
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
          <h1 className='text-2xl font-bold tracking-tight'>
            {data.barang.name}
          </h1>
        </div>
        <div className="">
          {/* <AddDialog data={modalData} /> */}
        </div>
      </div>
      <TheCard data={data.card} />
      <div className="rounded-sm border mt-4">
        <div className="flex justify-between p-4">
          {/* <div style={{ color }} className="font-semibold">{status}</div>
          <div>Print</div> */}
        </div>
        <Separator />

        <div className="flex flex-col md:flex-row items-start gap-6 p-4">
          <div className="flex-shrink-0 rounded-lg overflow-hidden w-full md:w-[200px] aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.barang.image ? data.barang.image : "https://generated.vusercontent.net/placeholder.svg"}
              alt={''}
              width={200}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 grid gap-2">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">{data.barang.name}</h3>
              <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">{data.barang.code}</div>
            </div>
            <p className="font-semibold">{data.barang.jumlah} {data.barang.uom}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
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
  )
}