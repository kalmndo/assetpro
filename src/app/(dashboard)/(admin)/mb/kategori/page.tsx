import { AddDialog } from "@/feature/mb-kategori/add-dialog";
import { Table } from "@/feature/mb-kategori/table";
import { api } from "@/trpc/server";

export default async function Page() {
  const data = await api.mbKategori.getAll()
  const golongans = await api.mbGolongan.getSelect()

  const modalData = {
    golongans
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Kategori
          </h1>
          <p className='text-muted-foreground'>
            Master barang kategori
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