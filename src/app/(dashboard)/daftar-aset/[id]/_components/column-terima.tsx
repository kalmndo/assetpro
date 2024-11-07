"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'

export const schema = z.object({
  id: z.string().optional(),
  no: z.string().optional(),
  tanggal: z.string().optional(),
})

export type Schema = z.infer<typeof schema>

export const columnsTerima: ColumnDef<Schema>[] = [
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

