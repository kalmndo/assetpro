"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import Link from 'next/link'

export const schema = z.object({
  kode: z.string(),
  name: z.string(),
  nilai: z.string()
})

export type Schema = z.infer<typeof schema>


export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'kode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kode Akun' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`/pengaturan/kode-anggaran/${row.original.kode}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('kode')}
          </span>
        </Link>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`/pengaturan/kode-anggaran/${row.original.kode}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </Link>
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
        <Link href={`/pengaturan/kode-anggaran/${row.original.kode}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('nilai')}
          </span>
        </Link>
      )
    },
    enableHiding: false,
  },
]
