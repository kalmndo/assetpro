import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={[
        "No inventaris",
        "Barang",
        "Harga Perolehan",
        "Masa Manfaat",
        "Penyusutan",
        "Nilai Buku",
        "Lokasi",
        "Kondisi",
        "Nilai Sisa",
      ]}
      title="Daftar Aset"
      subTitle="List Daftar Aset."
      placeholder="Nomor Inventaris ..."
      isButton={false}
    />
  );
}
