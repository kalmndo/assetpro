"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export const schema = z.object({
  name: z.string(),
  kode: z.string(),
  tersedia: z.number(),
  golongan: z.string(),
})

export type Schema = z.infer<typeof schema>


export const takTersediaColumns: ColumnDef<Schema>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <Avatar className='rounded-sm w-12 h-12'>
            {/* @ts-ignore */}
            <AvatarImage src={row.original.image} alt="@shadcn" />
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'kode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kode barang' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('kode')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'permintaan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permintaan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('permintaan')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'golongan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Golongan' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('golongan')}
          </span>
        </div>
      )
    },
  },
]
