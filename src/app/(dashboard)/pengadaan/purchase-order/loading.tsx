import LoadingTable from "@/components/loading-table";

export default function Loading() {
  return (
    <LoadingTable
      header={["No ", "Jumlah Barang", "Tanggal", "Status"]}
      title="Purchase Order"
      subTitle="List purchase order."
      placeholder="No PO..."
      isButton={false}
    />
  );
}
