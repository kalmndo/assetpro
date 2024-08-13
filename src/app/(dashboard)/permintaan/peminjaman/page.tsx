import { api } from "@/trpc/server";
import { Table } from "./_components/table";
import { AddDialog } from "./_components/add-dialog";

export default async function Page() {
  const data = await api.perbaikan.getAll({ isUser: true })
  const daftarAsets = await api.daftarAset.getSelectUser()
  return (
    <div>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Permintaan Peminjaman
          </h1>
          <p className='text-muted-foreground'>
            List permintaan peminjaman.
          </p>
        </div>
        <div className="">
          <AddDialog asets={daftarAsets} />
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <Table data={data} />
      </div>
    </div>
  )
}
