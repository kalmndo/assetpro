"use client"
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { type User, columns } from "@/feature/user/columns";
import { Plus } from "lucide-react";

const data: User[] = [
  {
    name: 'adam',
    email: 'kalmndo@gmail.com',
    department: 'Biro Mal',
    title: 'Kepala',
    role: 'admin'
  }
]

export default function Page() {


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
          <Button size="sm">
            <Plus size={18} className="mr-1" />
            Tambah
          </Button>
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  )
}
