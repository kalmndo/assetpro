import { api } from "@/trpc/server";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Table } from "./_components/table";
import { AddDialog } from "./_components/add-dialog";


export default async function Page() {
  const users = await api.teknisi.getAll()

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/master">Master</Link>
            </BreadcrumbLink>          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Master Teknisi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">

          <h1 className='text-2xl font-bold tracking-tight'>
            Master  Teknisi
          </h1>
          <p className='text-muted-foreground'>
            Manajemen Teknisi
          </p>
        </div>
        <div className="">
          <AddDialog users={users.users} />
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <Table data={users.result} users={users.users} />
      </div>
    </div>
  )
}