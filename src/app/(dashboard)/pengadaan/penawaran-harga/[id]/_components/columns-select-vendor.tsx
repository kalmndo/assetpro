"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  harga: z.number().nullable(),
  total: z.number().nullable(),
})

export type Schema = z.infer<typeof schema>

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor' />
    ),
    cell: ({ row }) => {

      return (
        <div className={`flex space-x-4 items-center`}>
          <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </p>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'harga',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Harga Satuan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            Rp {row.original.harga?.toLocaleString('id-ID')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Harga Total' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            Rp {row.original.total?.toLocaleString('id-ID')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
