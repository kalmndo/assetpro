import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["No ", "Jumlah Barang", "Tanggal", "Status"]}
      title="Penawaran Harga"
      subTitle="List penawaran harga."
      placeholder="Nomor FPPH ..."
      isButton={false}
    />
  );
}
