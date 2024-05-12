"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const schema = z.object({
  no: z.string(),
  perihal: z.string(),
  ruang: z.string(),
  jumlah: z.number(),
  tanggal: z.string(),
  status: z.string(),
})

export type Schema = z.infer<typeof schema>

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='No Internal Memo' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`barang/${row.getValue<string>('no')}`} className='flex w-full'>
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
    accessorKey: 'perihal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perihal & Tujuan' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`barang/${row.getValue<string>('no')}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('perihal')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'ruang',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ruang' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`barang/${row.getValue<string>('no')}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('ruang')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'jumlah',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jumlah' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`barang/${row.getValue<string>('no')}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('jumlah')}
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
        <Link href={`barang/${row.getValue<string>('no')}`} className='flex w-full'>
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
      return (
        <Link href={`barang/${row.getValue<string>('no')}`} className='flex w-full'>
          <Badge variant="default">
            {row.getValue('status')}
          </Badge>
        </Link>
      )
    },
  },
]
