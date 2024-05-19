import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={['Nama', 'Kode barang', 'Golongan']}
      title="Cari barang"
      subTitle="Cari barang permintaanmu atau gunakan kategori."
      placeholder="Nama"
      isButton={false}
    />
  )
}