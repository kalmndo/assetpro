import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["No ", "Jumlah Barang", "Tanggal", "Status"]}
      title="Permintaan Penawaran"
      subTitle="List permintaan penawaran."
      placeholder="Nomor FPP ..."
      isButton={false}
    />
  );
}
