import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["No ", "Jumlah Barang", "Tanggal", "Status"]}
      title="Evaluasi Harga"
      subTitle="List evaluasi harga."
      placeholder="Nomor FEPHB..."
      isButton={false}
    />
  );
}
