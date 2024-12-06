import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={[
        "Barang",
        "Kode Barang",
        "Kategori",
        "Satuan",
        "Jumlah",
        "Harga Rata-Rata",
      ]}
      title="Kartu Stok"
      subTitle="List Kartu Stok."
      placeholder="Nama barang ..."
      isButton={false}
    />
  );
}
