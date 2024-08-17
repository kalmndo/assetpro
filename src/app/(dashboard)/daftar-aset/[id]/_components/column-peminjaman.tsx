"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { getStatus } from '@/lib/status'

export const schema = z.object({
  id: z.string(),
  tipe: z.string(),
  no: z.string(),
  peminjam: z.string(),
  peruntukan: z.string(),
  from: z.string(),
  to: z.string(),
  status: z.string(),
})

export type Schema = z.infer<typeof schema>

export const columnsPeminjaman: ColumnDef<Schema>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='No' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("no")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'tipe',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipe' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("tipe")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'peminjam',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Peminjam' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("peminjam")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'peruntukan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Peruntukan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("peruntukan")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'from',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tgl pinjam' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("from")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'to',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tgl kembali' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("to")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { color, name } = getStatus(row.getValue("status"))

      return (
        <div className='flex space-x-2 items-center'>
          <span style={{ color }} className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {name}
          </span>
        </div>
      )
    },
  },
]

