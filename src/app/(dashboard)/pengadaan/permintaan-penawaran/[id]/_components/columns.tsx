"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  kode: z.string(),
  qty: z.number(),
  uom: z.string(),
  jumlahVendor: z.number()
})

export type Schema = z.infer<typeof schema>

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Barang' />
    ),
    cell: ({ row }) => {

      return (
        <div className={`flex space-x-2 items-center`}>
          <Avatar className='rounded-sm w-12 h-12'>
            <AvatarImage src={row.original.image} alt="@shadcn" />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className='block'>
            <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {row.getValue('name')}
            </p>
            <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {row.original.kode}
            </p>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jumlah' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {row.getValue('qty')} {row.original.uom}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'jumlahVendor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jumlah vendor terpilih' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {row.getValue('jumlahVendor')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
