import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["Nama ", "Kode Barang", "Tersedia", "Permintaan", "Golongan"]}
      title="Permintaan Barang"
      subTitle=" List permintaan barang yang."
      placeholder="Nama..."
      isButton={false}
    />
  );
}
