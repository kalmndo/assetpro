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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { columnsPembelian } from "./_components/column-pembelian";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columnPerbaikan } from "./_components/column-perbaikan";
import { columnsKeluar } from "./_components/column-keluar";
import { columnsTerima } from "./_components/column-terima";
import { columnsPenyusutan } from "./_components/column-penyusutan";
import Menu from "./_components/menu";
import Card from "./_components/card";
import { columnsPeminjaman } from "./_components/column-peminjaman";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.daftarAset.get({ id: id.replace(/-/g, "/") });

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
          <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
        </div>
        <div className="">{/* <AddDialog data={modalData} /> */}</div>
      </div>
      <Card data={data.card} />
      <div className="mt-4 rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color: "green" }} className="font-semibold">
            {data.status}
          </div>
          <Menu id={data.no} audit={data.audit} />
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
                  <h3 className="text-xl font-semibold">{data.no}</h3>
                  <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {data.barang.code}
                  </div>
                </div>
                {/* <p className="font-semibold">{data.barang.jumlah} {data.barang.uom}</p> */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.barang.desc}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm">Pengguna</p>
            <Avatar className="h-14 w-14">
              <AvatarImage src={data.pengguna.image ?? ""} alt="@shadcn" />
              <AvatarFallback>
                {data.pengguna.name && getInitials(data.pengguna.name)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{data.pengguna.name}</p>
            <div className="text-sm">
              <p>{data.pengguna.title}</p>
              <p>{data.pengguna.department}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <p className="mb-2 pl-4 font-semibold">Informasi Tambahan Aset</p>
            <div className="space-y-4 pl-4">
              <div className="space-y-2">
                <p className="text-sm">Garansi</p>
                <p className="font-semibold">{data.garansi}</p>
              </div>
              {data.info.map((v, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm">{v.name}</p>
                  <p className="font-semibold">{v.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Lokasi</p>
              <p className="font-semibold">{data.lokasi}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Peruntukan</p>
              <p className="font-semibold">{data.peruntukan}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Separator className="mt-4" />
        </div>
        <div className="space-y-2 p-4">
          <p className="mb-2 font-semibold">Pembelian</p>
          <DataTable
            data={[
              {
                harga: data.pembelian.harga,
                id: "",
                noPo: data.pembelian.noPo,
                tgl: data.pembelian.tgl,
                vendor: data.pembelian.vendor,
              },
            ]}
            columns={columnsPembelian}
            isPagintation={false}
          />
        </div>
        <div className="space-y-2 p-4">
          <p className="mb-2 font-semibold">Penyusutan</p>
          <DataTable
            data={[data.penyusutan]}
            columns={columnsPenyusutan}
            isPagintation={false}
          />
        </div>
        <div className="p-4">
          <p className="mb-2 font-semibold">Riwayat</p>
          <Tabs defaultValue="perbaikan">
            <TabsList>
              <TabsTrigger value="perbaikan">Perbaikan</TabsTrigger>
              <TabsTrigger value="keluar">Keluar</TabsTrigger>
              <TabsTrigger value="masuk">Masuk</TabsTrigger>
              <TabsTrigger value="peminjaman">Peminjaman</TabsTrigger>
            </TabsList>
            <TabsContent value="perbaikan">
              <DataTable data={data.perbaikan} columns={columnPerbaikan} />
            </TabsContent>
            <TabsContent value="keluar">
              <DataTable data={data.keluar} columns={columnsKeluar} />
            </TabsContent>
            <TabsContent value="masuk">
              <DataTable data={[data.terima]} columns={columnsTerima} />
            </TabsContent>
            <TabsContent value="peminjaman">
              <DataTable data={data.peminjaman} columns={columnsPeminjaman} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

