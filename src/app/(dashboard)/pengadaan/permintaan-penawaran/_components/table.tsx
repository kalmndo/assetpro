"use client";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { STATUS } from "@/lib/status";

const status = [STATUS.PENGAJUAN, STATUS.SELESAI]

export function Table({ data }: { data: any }) {
  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        filter={{ column: "no", placeholder: "Nomor FPP..." }}
        defaultFilters={[
          { id: 'status', value: [STATUS.PENGAJUAN.id] }
        ]}
        facetedFilter={[
          {
            column: 'status',
            title: "Status",
            options: status.map((v) => ({
              label: v.name,
              value: v.id
            }))
          }
        ]}
      />
    </div>
  );
}

