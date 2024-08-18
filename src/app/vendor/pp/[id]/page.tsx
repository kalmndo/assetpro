"use server"

import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";
import { getStatus } from "@/lib/status";
import Content from "./_components/content";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.vendor.getPermintaanPenawaran({ id })

  const { color, name: status } = getStatus(data.status ? 'selesai' : 'menunggu')

  return (
    <div className="container max-w-5xl mx-auto mt-[100px]">
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Permintaan penawaran harga
          </h1>
        </div>
        <div className="">
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">{status}</div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Dari</p>
              <p className="font-semibold">Yayasan Alfian Husin</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Nomor</p>
              <p className="font-semibold">{data.no}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal</p>
              <p className="font-semibold">{data.tanggal}</p>
            </div>
          </div>
          <div className="col-span-1 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Kepada</p>
              <p className="font-semibold">{data.Vendor.name}</p>
              <p className="text-sm">{data.Vendor.alamat}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Content data={data} />
        </div>
      </div>
    </div>
  )
}