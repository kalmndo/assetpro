"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import Link from 'next/link'
import { getStatus } from '@/lib/status'

export const schema = z.object({
  id: z.string(),
  no: z.string(),
  perihal: z.string(),
  ruang: z.string(),
  jumlah: z.number(),
  tanggal: z.string(),
  status: z.string(),
  Pemohon: z.object({ name: z.string() }).nullable()
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
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
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
    accessorKey: 'pemohon',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pemohon' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.original.Pemohon?.name}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'perihal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perihal & Tujuan' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
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
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
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
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
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
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
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
        <Link href={`permintaan-barang/${row.original.id}`} className='flex w-full'>
          <span style={{ color }} className='max-w-32 truncate font-semibold sm:max-w-72 md:max-w-[31rem]'>
            {name}
          </span>
        </Link>
      )
    },
  },
]
