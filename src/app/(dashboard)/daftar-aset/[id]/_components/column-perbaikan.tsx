"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
// id: string; no: string; teknisi: string | undefined; keluhan: string; catatan: string | null; tanggal: string; status: string; biaya: string;
export const schema = z.object({
  id: z.string(),
  no: z.string(),
  teknisi: z.string().optional(),
  keluhan: z.string(),
  catatan: z.string().nullable(),
  tanggal: z.string(),
  status: z.string(),
  biaya: z.string(),
})

export type Schema = z.infer<typeof schema>

export const columnPerbaikan: ColumnDef<Schema>[] = [
  {
    accessorKey: 'no',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nomor' />
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
    accessorKey: 'teknisi',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teknisi' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("teknisi")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'keluhan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Keluhan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("keluhan")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'catatan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Catatan Teknisi' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("catatan")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'biaya',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Biaya' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("biaya")}
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
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue("status")}
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

