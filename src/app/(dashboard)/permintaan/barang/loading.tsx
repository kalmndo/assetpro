import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={['No Internal Memo', 'Perihal & Tujuan', 'Ruang', 'Jumlah', 'Tanggal', 'Status']}
      title="Permintaan Barang"
      subTitle="List permintaan barang kamu."
      placeholder="No Internal Memo ..."
    />
  )
}