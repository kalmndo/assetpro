import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { getStatus } from "@/lib/status";
import { ScrollArea } from "@/components/ui/scroll-area";
import formatDate from "@/lib/formatDate";
import { api } from "@/trpc/server";
import RejectDialog from "./_components/reject-dialog";
import ApproveDialog from "./_components/approve-dialog";
import SendToVendorDialog from "./_components/send-to-vendor-dialog";
import ReceiveDialog from "./_components/receive-dialog";
import SendToUserDialog from "./_components/send-to-user-dialog";
import ComponentWrapper from "./_components/component-wrapper";
import TableKomponen from "./_components/table-komponen";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.perbaikanEksternal.getById({ id })
  const { color, name: status } = getStatus(data.status)

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/perbaikan"> Perbaikan eksternal</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail perbaikan eksternal</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Perbaikan eksternal
          </h1>
        </div>
        <div className="">
          {/* <AddDialog data={modalData} /> */}
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
              <p className="text-sm">Nomor</p>
              <p className="font-semibold">{data.no}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal</p>
              <p className="font-semibold">{data.tanggal}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">No Perbaikan</p>
              <p className="text-sm">{data.noPerbaikan}</p>
            </div>

          </div>
          <div className="space-y-4">
            <p className="text-sm">Vendor</p>
            <Avatar className='w-14 h-14'>
              <AvatarImage src={data.vendor.name ?? ''} alt="@shadcn" />
              <AvatarFallback>{getInitials(data.vendor.name)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{data.vendor.name}</p>
            <div className="text-sm">
              <p>{data.vendor.alamat}</p>
              <p>{data.vendor.email} - {data.vendor.nohp} - {data.vendor.whatsapp}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-lg border mb-5">
            <div className="flex-shrink-0 rounded-lg overflow-hidden w-full md:w-[200px] aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={!data.barang.image ? "https://generated.vusercontent.net/placeholder.svg" : data.barang.image}
                alt={data.barang.name}
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 grid gap-2">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{data.barang.name}</h3>
              </div>
              <p>No Inventaris: {data.barang.noInv}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.barang.deskripsi}
              </p>
            </div>
          </div>
          {data.teknisi &&
            <>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <p className="text-sm">Teknisi</p>
                  <p className="font-semibold">{data.teknisi}</p>
                </div>
              </div>
              <div className="flex justify-between my-4">
                <div className="space-y-2">
                  <p className="text-sm">Catatan Teknisi</p>
                  <p className="text-sm">{data.catatanTeknisi}</p>
                </div>
              </div>
            </>
          }
          <ComponentWrapper data={data} >
            <TableKomponen data={data.components} />
          </ComponentWrapper>
          {data.isAtasanCanApprove &&
            <div className="flex justify-end space-x-4">
              <RejectDialog id={data.id} />
              <ApproveDialog id={data.id} />
            </div>
          }
          {data.canSendToVendor &&
            <div className="flex justify-end space-x-4">
              <SendToVendorDialog id={data.id} />
            </div>
          }
          {data.canSendToUser &&
            <div className="flex justify-end space-x-4">
              <SendToUserDialog id={data.id} />
            </div>
          }
        </div>
        <div className="p-4">
          <p className="font-semibold text-lg">Riwayat</p>
          <div className="border rounded-lg p-4">
            <ScrollArea className="h-[400px]">
              <div className="w-full max-w-4xl mx-auto ml-4">
                <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-muted-foreground/20">
                  <div className="grid gap-8">
                    {data.riwayat.map((v: any, i: number) => {
                      const { day, hours, minutes, monthName } = formatDate(v.createdAt)
                      return (
                        <div key={i} className="grid gap-2 text-sm relative">
                          <div className="aspect-square w-3 bg-primary rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1"></div>
                          <div className="font-medium">{day}, {monthName} {hours}:{minutes} WIB</div>
                          <div className="font-semibold">{v.desc}</div>
                          <div className="text-sm text-blue-700">{v.formNo}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}