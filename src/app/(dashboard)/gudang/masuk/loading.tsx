import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["Nomor", "Jumlah Barang", "Tanggal"]}
      title="Barang Masuk"
      subTitle=" List Barang Masuk."
      placeholder="Nomor..."
      isButton={false}
    />
  );
}
