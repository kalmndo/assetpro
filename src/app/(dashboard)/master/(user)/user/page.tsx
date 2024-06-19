import { AddDialog } from "@/feature/user/add-dialog";
import { Table } from "@/feature/user/table";
import { api } from "@/trpc/server";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";


export default async function Page() {
  const users = await api.user.getAll()
  const departments = await api.department.getSelect()
  const atasans = await api.user.getAtasanSelect()
  const departmentUnits = await api.departmentUnit.getSelect()
  const organisasis = await api.organisasi.getSelect()

  const modalData = {
    departments,
    atasans,
    departmentUnits,
    organisasis
  }

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
            <BreadcrumbPage>User</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">

          <h1 className='text-2xl font-bold tracking-tight'>
            User
          </h1>
          <p className='text-muted-foreground'>
            Manajemen User
          </p>
        </div>
        <div className="">
          <AddDialog data={modalData} />
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <Table data={users} modalData={modalData} />
      </div>
    </div>
  )
}