"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { STATUS } from "@/lib/status";

const status = [STATUS.SELESAI, STATUS.PROCESS]

export function Table({ data }: { data: any }) {

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        filter={{ column: 'no', placeholder: 'No Internal Memo ...' }}
        defaultFilters={[
          {
            id: 'status',
            value: [STATUS.SELESAI.id]
          }
        ]}
        facetedFilter={[
          {
            column: "status",
            title: "status",
            options: status.map((v) => ({
              label: v.name,
              value: v.id
            }))
          }
        ]}
      />
    </div>
  )
}