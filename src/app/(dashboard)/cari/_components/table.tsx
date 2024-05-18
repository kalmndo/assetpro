"use client"
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useSetAtom, } from "jotai";
import { cartsAtom } from "@/data/cart";

export function Table({ data }: { data: any }) {
  const setCarts = useSetAtom(cartsAtom)


  const checkboxToolbarActions = [
    {
      title: 'Simpan',
      desc: "Simpan ke keranjang permintaan",
      handleAction: (table: any) => {
        const newData = table.getFilteredSelectedRowModel().rows.map((v: any) => ({
          id: v.original.id,
          image: v.original.image,
          kode: v.original.kode,
          name: v.original.name,
          kodeAnggaran: [],
          qty: '1',
          uom: v.original.uom,
          uomId: v.original.uomId
        }))

        // @ts-ignore
        setCarts((prev: any) => [
          ...prev,
          ...newData.filter((newItem: any) => !prev.some((prevItem: any) => prevItem.id === newItem.id)),
        ])

        table.resetRowSelection()
      },
      variant: 'default'
    },
  ]

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        filter={{ column: 'name', placeholder: 'Nama ...' }}
        columnVisibilityDefaultState={{ kategori: false, subKategori: false, subSubKategori: false }}
        checkboxToolbarActions={checkboxToolbarActions}
      />
    </div>
  )
}