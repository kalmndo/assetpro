"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  no: z.string(),
  vendor: z.string(),
  jumlah: z.number(),
  hargaSatuan: z.string(),
  hargaTotal: z.string(),
  tanggal: z.string(),
})

export type Schema = z.infer<typeof schema>

export const columnsMasuk: ColumnDef<Schema>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='No Fttb' />
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
    accessorKey: 'vendor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("vendor")}
          </span>
        </div>
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
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("jumlah")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'hargaSatuan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Harga satuan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("hargaSatuan")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'hargaTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Harga total' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("hargaTotal")}
          </span>
        </div>
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
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("tanggal")}
          </span>
        </div>
      )
    },
  },
]
