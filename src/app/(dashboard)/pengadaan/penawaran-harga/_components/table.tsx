"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export function Table({ data }: { data: any }) {

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        filter={{ column: 'no', placeholder: 'No FPPB...' }}
      />
    </div>
  )
}