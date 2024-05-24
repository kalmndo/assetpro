"use client"

import { DataTable } from "@/components/data-table"
import { useState } from "react"
import { tersediaColumns } from "./tersedia-columns"
import { takTersediaColumns } from "./tak-tersedia-columns"

function TersediaTable({ data }: { data: any[] }) {
  return (

    <DataTable
      data={data}
      columns={tersediaColumns}
      filter={{ column: 'name', placeholder: 'Nama ...' }}
    // checkboxToolbarActions={checkboxToolbarActions}
    />
  )
}

function TakTersediaTable({ data }: { data: any[] }) {
  return (

    <DataTable
      data={data}
      columns={takTersediaColumns}
      filter={{ column: 'name', placeholder: 'Nama ...' }}
    // checkboxToolbarActions={checkboxToolbarActions}
    />
  )
}

export default function Table({ data: { tersedia, takTersedia } }: { data: { tersedia: any[], takTersedia: any[] } }) {
  const [type, setType] = useState(1)
  return (
    <div>
      {type === 1 ?
        <TersediaTable data={tersedia} />
        : <TakTersediaTable data={takTersedia} />
      }

    </div>
  )
}