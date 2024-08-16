import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatus } from "@/lib/status";
import { getInitials } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";
import ApproveDialog from "./approve-dialog";
import AtasanApproveDialog from "./atasan-approve-dialog";
import SendToUserDialog from "./send-to-user-dialog";
import UserReceiveDialog from "./user-receive-dialog";
import UserReturnDialog from "./user-return-dialog";
import ReceiveDialog from "./receive-dialog";

export default async function Page({ data }: { data: RouterOutputs['peminjaman']['get'] }) {
  const { color, name: status } = getStatus(data.status)

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/peminjaman">Peminjaman</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Peminjaman</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Permintaan Peminjaman
          </h1>
        </div>
        <div className="">
          {/* <AddDialog data={modalData} /> */}
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div style={{ color }} className="font-semibold">{status}</div>
          <div>Print</div>
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
          </div>
          <div className="space-y-4">
            <p className="text-sm">Pemohon</p>
            <Avatar className='w-14 h-14'>
              <AvatarImage src={data.peminjam.image ?? ''} alt="@shadcn" />
              <AvatarFallback>{getInitials(data.peminjam.name)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{data.peminjam.name}</p>
            <div className="text-sm">
              <p>{data.peminjam.title}</p>
              <p>{data.peminjam.Department.name} - {data.peminjam.DepartmentUnit?.name}</p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="p-4">
          <div className="flex gap-10 mb-4">
            <div className="space-y-2">
              <p className="text-sm">Tipe</p>
              <p className="font-semibold">{data.tipe}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">{data.tipe}</p>
              <p className="font-semibold">{data.item}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Tanggal peminjaman</p>
              <p className="font-semibold">{data.from} - {data.to}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm">Peruntukaan</p>
            <p className="text-sm">{data.peruntukan}</p>
          </div>
        </div>
        <div className="p-4" >
          {data.isAtasanCanApprove &&
            <div className="flex justify-end space-x-4">
              <AtasanApproveDialog id={data.id} />
            </div>
          }
          {data.isCanApprove &&
            <div className="flex justify-end space-x-4">
              <ApproveDialog id={data.id} />
            </div>
          }
          {data.isCanSendToUser &&
            <div className="flex justify-end space-x-4">
              <SendToUserDialog id={data.id} />
            </div>
          }
          {data.isUserCanReceive &&
            <div className="flex justify-end space-x-4">
              <UserReceiveDialog id={data.id} />
            </div>
          }
          {data.isUserCanReturn &&
            <div className="flex justify-end space-x-4">
              <UserReturnDialog id={data.id} />
            </div>
          }
          {data.isMalCanReceive &&
            <div className="flex justify-end space-x-4">
              <ReceiveDialog id={data.id} />
            </div>
          }
        </div>
        <div className="p-4">
          {/* <Table data={data} modalData={modalData} /> */}
        </div>
      </div>
    </div>
  )
}