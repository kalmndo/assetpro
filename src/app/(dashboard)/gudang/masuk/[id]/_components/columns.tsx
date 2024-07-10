"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export const schema = z.object({
  id: z.string(),
  qty: z.number(),
  uom: z.string(),
  name: z.string(),
  image: z.string().nullable()
})

export type Schema = z.infer<typeof schema>


export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'barang',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Barang' />
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
            {row.original.name}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jumlah Barang' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`masuk/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('qty')} {row.original.uom}
          </span>
        </Link>
      )
    },
  },
]

