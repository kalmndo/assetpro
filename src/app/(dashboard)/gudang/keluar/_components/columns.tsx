"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import Link from 'next/link'

export const schema = z.object({
  id: z.string(),
  no: z.string(),
  jumlah: z.string(),
  createdAt: z.string(),
})

export type Schema = z.infer<typeof schema>


export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nomor' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`keluar/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('no')}
          </span>
        </Link>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'jumlah',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jumlah Barang' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('jumlah')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tanggal' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`keluar/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('createdAt')}
          </span>
        </Link>
      )
    },
  },
]
