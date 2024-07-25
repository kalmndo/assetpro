
import { api } from "@/trpc/server";
import KategoriDialog from "./_components/kategori-dialog";
import { Table } from "./_components/table";
import { AddDialog } from "@/feature/mb-barang/add-dialog";

export default async function Page({
  searchParams
}: {
  searchParams: Record<string, string | undefined>

}) {
  const { data, filterName } = await api.cariBarang.getList({ kategori: searchParams?.kategori ?? '' })
  const { aset, persediaan } = await api.cariBarang.getAllKategori()

  const golongans = await api.mbGolongan.getSelect()
  const kategoris = await api.mbKategori.getSelect()
  const subKategoris = await api.mbSubKategori.getSelect()
  const subSubKategoris = await api.mbSubSubKategori.getSelect()
  const uoms = await api.mUom.getSelect()

  const modalData = {
    golongans,
    kategoris,
    subKategoris,
    subSubKategoris,
    uoms
  }



  return (
    <div>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Cari barang
          </h1>
          <p className='text-muted-foreground'>
            Cari barang permintaanmu atau gunakan kategori.
          </p>
        </div>
        <div className="flex space-x-4">
          <AddDialog data={modalData} isUser />
          <KategoriDialog aset={aset[0]?.child} persediaan={persediaan[0]?.child} kategori={filterName} />
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <Table data={data} />
      </div>
    </div>
  )
}
