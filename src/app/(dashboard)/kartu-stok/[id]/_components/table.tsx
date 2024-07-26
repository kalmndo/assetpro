import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columnsMasuk } from "./columns-masuk";
import { columnsKeluar } from "./columns-keluar";
import { RouterOutputs } from "@/trpc/react";

function TableMasuk({ data }: { data: RouterOutputs['kartuStok']['get']['riwayat']['masuk'] }) {
  return (
    <DataTable
      data={data}
      columns={columnsMasuk}
    />
  )
}

function TableKeluar({ data }: { data: RouterOutputs['kartuStok']['get']['riwayat']['keluar'] }) {
  return (
    <DataTable
      data={data}
      columns={columnsKeluar}
    />
  )
}

export default function Table({ data }: { data: RouterOutputs['kartuStok']['get']['riwayat'] }) {
  return (
    <div>
      <Tabs defaultValue="masuk" className="w-full">
        <TabsList>
          <TabsTrigger value="masuk">Stok masuk</TabsTrigger>
          <TabsTrigger value="keluar">Stok keluar</TabsTrigger>
        </TabsList>
        <TabsContent value="masuk">
          <TableMasuk data={data.masuk} />
        </TabsContent>
        <TabsContent value="keluar">
          <TableKeluar data={data.keluar} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
