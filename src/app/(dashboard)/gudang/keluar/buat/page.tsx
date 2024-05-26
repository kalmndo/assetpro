import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Table from "./_components/table";

export default async function Page() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            Gudang
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            Keluar
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Buat</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Form Tanda Keluar Barang
          </h1>
        </div>
        <div className="">
          {/* button right */}
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="flex justify-between p-4">
          <div className="font-semibold text-yellow-700">Draft</div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Perihal</p>
              <p className="text-sm">Permohonan internal memo</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Table />
          {/* <Table data={data} modalData={modalData} /> */}
        </div>
      </div>
    </div>
  )
}