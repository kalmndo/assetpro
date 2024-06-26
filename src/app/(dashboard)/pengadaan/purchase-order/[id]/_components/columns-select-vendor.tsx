"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  alamat: z.string(),
  whatsapp: z.string(),
  nohp: z.string(),
  email: z.string(),
})

export type Schema = z.infer<typeof schema>

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor' />
    ),
    cell: ({ row }) => {

      return (
        <div className={`flex space-x-4 items-center`}>
          <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </p>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'alamat',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Alamat' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {row.getValue('alamat')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'whatsapp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Whatsapp' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {row.getValue('whatsapp')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'nohp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nomor HP' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {row.getValue('nohp')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-4'>
          <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
            {row.getValue('email')}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
