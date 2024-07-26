import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TableMasuk() {
  return (
    <DataTable
      data={[]}
      columns={[]}
    />
  )
}

function TableKeluar() {
  return (
    <DataTable
      data={[]}
      columns={[]}
    />
  )
}

export default function Table() {
  return (
    <div>
      <Tabs defaultValue="masuk" className="w-full">
        <TabsList>
          <TabsTrigger value="masuk">Stok masuk</TabsTrigger>
          <TabsTrigger value="keluar">Stok keluar</TabsTrigger>
        </TabsList>
        <TabsContent value="masuk">
          <TableMasuk />
        </TabsContent>
        <TabsContent value="keluar">
          <TableKeluar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
// masuk
// nama
// jumlah
// tanggal

// keluar
// vendor
// jumlah
// harga satuan
// harga total
// tanggal