import { DataTable } from "@/components/data-table";
import { AddModal } from "@/feature/user/add-modal";
import { columns } from "@/feature/user/columns";
import { api } from "@/trpc/server";

export default async function Page() {
  const users = await api.user.getAll()
  const departments = await api.department.getSelect()
  const atasans = await api.user.getAtasanSelect()

  const modalData = {
    departments,
    atasans
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            User
          </h1>
          <p className='text-muted-foreground'>
            Manajemen User
          </p>
        </div>
        <div className="">
          <AddModal data={modalData} />
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable data={users} columns={columns} />
      </div>
    </div>
  )
}