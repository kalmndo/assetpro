import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import Content from "./_components/content";

export default async function Page() {

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/pengaturan">Pengaturan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Penomoran Otomatis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Penomoran Otomatis
          </h1>
        </div>
      </div>
      <div className="rounded-sm border">
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-3">
            <p className="text-sm">Tentukan nomor yang digunakan untuk membuat penomoran tagihan. Nomor dibawah akan otomatis ditambah setiap dokumen baru dibuat.</p>
          </div>
        </div>
        <div>
          <Content />
        </div>
      </div>
    </div>
  )
}