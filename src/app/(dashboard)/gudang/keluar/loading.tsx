import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["Nomor", "Jumlah Barang", "Tanggal"]}
      title="Barang Keluar"
      subTitle=" List Barang Keluar."
      placeholder="Nomor..."
      isButton={false}
    />
  );
}
