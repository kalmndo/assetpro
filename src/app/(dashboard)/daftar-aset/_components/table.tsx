"use client";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export function Table({ data }: { data: any }) {
  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        filter={{ column: "no", placeholder: "No Internal Memo ..." }}
        facetedFilter={[
          {
            column: "satuan",
            title: "Periode",
            options: [
              {
                label: "Pcs",
                value: "pcs",
              },
            ],
          },
          {
            column: "satuan",
            title: "Unit Usaha",
            options: [
              {
                label: "Pcs",
                value: "pcs",
              },
            ],
          },
          {
            column: "satuan",
            title: "Klasifikasi",
            options: [
              {
                label: "Pcs",
                value: "pcs",
              },
            ],
          },
          {
            column: "satuan",
            title: "Sub Klasifikasi",
            options: [
              {
                label: "Pcs",
                value: "pcs",
              },
            ],
          },
        ]}
      />
    </div>
  );
}

