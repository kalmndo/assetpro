'use client'

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default function Table() {
  return (
    <div>
      <DataTable
        data={[]}
        columns={columns}
      />
    </div>
  )
}