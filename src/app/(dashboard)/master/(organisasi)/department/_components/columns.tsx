"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'

export const schema = z.object({
  name: z.string(),
  organisasi: z.string()
})

export type Schema = z.infer<typeof schema>


export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'organisasi',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Organisasi' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('organisasi')}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
]
