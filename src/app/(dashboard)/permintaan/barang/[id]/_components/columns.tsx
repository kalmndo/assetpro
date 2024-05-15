"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  kode: z.string().nullable(),
  jumlah: z.string(),
  uom: z.object({
    id: z.string(),
    name: z.string()
  }).nullable(),
  status: z.string().nullable(),
  kodeAnggaran: z.array(z.string()),
  qtyUpdate: z.string().nullable(),
  uomUpdate: z.object({
    id: z.string(),
    name: z.string()
  }).nullable()
})

export type Schema = z.infer<typeof schema>

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Barang' />
    ),
    cell: ({ row }) => {
      const isReject = row.original.status === 'to-reject'
      return (
        <div className={`flex space-x-2 items-center ${isReject && 'opacity-25'}`}>
          <Avatar className='rounded-sm w-12 h-12'>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
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
    accessorKey: 'jumlah',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='jumlah' />
    ),
    cell: ({ row }) => {
      const isReject = row.original.status === 'to-reject'
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] ${isReject && 'opacity-25'} ${row.original.qtyUpdate && 'line-through'}`}>
            {row.getValue('jumlah')} {row.original.uom?.name}
          </span>
          {row.original.qtyUpdate &&
            <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] ${isReject && 'opacity-25'}`}>
              {row.original.qtyUpdate} {row.original.uomUpdate?.name}
            </span>}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'kodeAnggaran',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kode Anggaran' />
    ),
    cell: ({ row }) => {
      const isReject = row.original.status === 'to-reject'
      return (
        <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] ${isReject && 'opacity-25'}`}>
          {row.original.kodeAnggaran[0]}
        </span>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
