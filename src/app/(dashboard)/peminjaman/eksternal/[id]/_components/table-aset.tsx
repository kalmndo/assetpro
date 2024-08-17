"use client"

import { DataTable } from "@/components/data-table"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { type RouterOutputs } from "@/trpc/react"

export default function TableAset({
  asets
}: {
  asets: RouterOutputs['peminjamanEksternal']['get']['asets']
}) {
  return (
    <DataTable
      data={asets}
      columns={[
        {
          id: "no",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title='No Inventaris' />
          ),
          cell: ({ row }) => {
            return (
              <div className={`flex space-x-4 items-center`}>
                <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                  {row.original.Aset.id}
                </p>
              </div>
            )
          },
          enableSorting: false,
          enableHiding: false,
        },
        {
          id: 'pengguna',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Pengguna' />
          ),
          cell: ({ row }) => {
            return (
              <div className='flex space-x-4'>
                <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
                  {row.original.Aset.Pengguna?.name}
                </span>
              </div>
            )
          },
          enableSorting: false,
          enableHiding: false,
        },
      ]}
      isPagintation={false}
    />
  )
}