"use client"
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export const schema = z.object({
  id: z.string(),
  barang: z.object({
    name: z.string(),
    image: z.string().nullable()
  }),
  code: z.string(),
  kategori: z.string(),
  satuan: z.number(),
  jumlah: z.string(),
  harga: z.string(),
  total: z.string(),
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
            <AvatarImage src={row.original.barang.image ?? ''} alt="@shadcn" />
            <AvatarFallback>{getInitials(row.original.barang.name)}</AvatarFallback>
          </Avatar>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.original.barang.name}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kode Barang' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`kartu-stok/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('code')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'kategori',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kategori' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`kartu-stok/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('kategori')}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: 'satuan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Satuan' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`kartu-stok/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('satuan')}
          </span>
        </Link>
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
        <Link href={`kartu-stok/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('jumlah')}
          </span>
        </Link>
      )
    },
    footer: ({ table }) => {
      const res = table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.jumlah, 0)
      return res
    },
  },
  {
    accessorKey: 'harga',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Harga Satuan' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`kartu-stok/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('harga')}
          </span>
        </Link>
      )
    },
    footer: ({ table }) => {
      const res = table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.hargaNum, 0)
      return `Rp ${res.toLocaleString("id-ID")}`
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total harga' />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`kartu-stok/${row.original.id}`} className='flex w-full'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            Rp {row.getValue('total')}
          </span>
        </Link>
      )
    },
    footer: ({ table }) => {
      const res = table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.totalNum, 0)
      return `Rp ${res.toLocaleString("id-ID")}`
    },
  },
]
