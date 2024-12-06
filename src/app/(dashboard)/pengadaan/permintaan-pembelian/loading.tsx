import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["No ", "Jumlah Barang", "Tanggal", "Status"]}
      title="Permintaan Pembelian"
      subTitle="List permintaan pembelian."
      placeholder="Nomor FPPB ..."
      isButton={false}
    />
  );
}
