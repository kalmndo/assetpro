"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export function Table({ data }: { data: any }) {

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        filter={{ column: 'name', placeholder: 'Nama ...' }}
        columnVisibilityDefaultState={{ kategori: false, subKategori: false, subSubKategori: false }}
      // ini masalah di column
      // facetedFilter={[{ column: 'golongan', title: "Golongan", options: [{ label: 'Aset', value: "Aset" }] }]}
      />
    </div>
  )
}