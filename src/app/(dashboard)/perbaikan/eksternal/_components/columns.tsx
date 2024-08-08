"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import Link from 'next/link'
import { getStatus } from '@/lib/status'

export const schema = z.object({
  id: z.string(),
  no: z.string(),
  barang: z.string(),
  pemohon: z.number(),
  tanggal: z.string(),
  status: z.string(),
})

export type Schema = z.infer<typeof schema>

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='No' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`eksternal/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('no')}
          </span>
        </Link>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'barang',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Barang' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`eksternal/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('barang')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'pemohon',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='pemohon' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`eksternal/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('pemohon')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'tanggal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tanggal' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`eksternal/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('tanggal')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { color, name } = getStatus(row.getValue('status'))
      return (
        <Link href={`eksternal/${row.original.id}`} className='flex w-full'>
          <span style={{ color }} className='max-w-32 truncate font-semibold sm:max-w-72 md:max-w-[31rem]'>
            {name}
          </span>
        </Link>
      )
    },
  },
]
