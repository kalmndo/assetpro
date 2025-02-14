"use client";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/react";
import Card from './card'

export function Table({ data }: { data: RouterOutputs['daftarAset']['getAll'] }) {

  return (
    <div className="space-y-4">
      {/* <Card data={{ harga: 0, susut: 0, buku: 0 }} /> */}
      <div>
        <DataTable
          // @ts-ignore
          data={data.data}
          columns={columns}
          filter={{ column: "no", placeholder: "Nomor inventaris ..." }}
          columnVisibilityDefaultState={{ kategori: false, tahun: false, org: false, pengguna: false }}
          facetedFilter={[
            {
              column: "tahun",
              title: "Periode",
              options: data.filter.filterPeriod.map((v) => ({
                label: v,
                value: v
              }))
            },
            {
              column: "org",
              title: "Unit Usaha",
              options: data.filter.filterOrg.map((v) => ({
                label: v,
                value: v
              }))
            },
            {
              column: "kategori",
              title: "Klasifikasi",
              options: data.filter.filterKlasifikasi.map((v) => ({
                label: v,
                value: v
              }))
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
    </div>
  );
}

