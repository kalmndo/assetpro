import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={['Kode Akun', 'Nama', 'Department', 'Sisa Anggaran']}
      title="Kode Anggaran"
      subTitle="Data kode anggaran"
      placeholder="Nama ..."
      isButton={false}
    />
  )
}