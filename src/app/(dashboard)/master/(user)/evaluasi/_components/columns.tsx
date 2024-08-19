"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export const schema = z.object({
  name: z.string(),
  nilai: z.number(),
  User: z.object({
    image: z.string(),
    name: z.string()
  })
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
          <Avatar>
            <AvatarImage src={row.original.User.image} alt="@shadcn" />
            <AvatarFallback>{getInitials(row.original.User.name)}</AvatarFallback>
          </Avatar>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.original.User.name}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'nilai',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nilai' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2 items-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            Rp {row.original.nilai.toLocaleString("id-ID")}
          </span>
        </div>
      )
    },
    enableHiding: false,
  },
]
