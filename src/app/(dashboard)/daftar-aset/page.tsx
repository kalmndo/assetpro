import { api } from "@/trpc/server";
import { Table } from "./_components/table";

export default async function Page() {
  const data = await api.daftarAset.getAll()

  return (
    <div>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Kartu Stok
          </h1>
          <p className='text-muted-foreground'>
            List Kartu Stok
          </p>
        </div>
        <div className="">

        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <Table data={data} />
      </div>
    </div>
  )
}
