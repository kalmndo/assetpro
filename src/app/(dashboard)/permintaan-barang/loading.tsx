import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={['No Internal Memo', 'Pemohon', 'Perihal & Tujuan', 'Ruang', 'Jumlah', 'Tanggal', 'Status']}
      title="Permintaan Barang"
      subTitle="List permintaan yang telah disetujui atasan user"
      placeholder="No Internal Memo ..."
      isButton={false}
    />
  )
}