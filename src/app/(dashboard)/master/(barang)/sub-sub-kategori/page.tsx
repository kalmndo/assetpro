import { AddDialog } from "@/feature/mb-sub-sub-kategori/add-dialog";
import { Table } from "@/feature/mb-sub-sub-kategori/table";
import { api } from "@/trpc/server";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";


export default async function Page() {
  const data = await api.mbSubSubKategori.getAll()
  const golongans = await api.mbGolongan.getSelect()
  const kategoris = await api.mbKategori.getSelect()
  const subKategoris = await api.mbSubKategori.getSelect()

  const modalData = {
    golongans,
    kategoris,
    subKategoris
  }

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/master">Master</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sub Sub Kategori</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Sub Sub Kategori
          </h1>
          <p className='text-muted-foreground'>
            Master Sub Sub Kategori
          </p>
        </div>
        <div className="">
          <AddDialog data={modalData} />
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <Table data={data} modalData={modalData} />
      </div>
    </div>
  )
}