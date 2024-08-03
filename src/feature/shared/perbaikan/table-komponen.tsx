"use client"
import { DataTable } from "@/components/data-table";
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { z } from 'zod'
import { RouterOutputs } from "@/trpc/react";
import Link from "next/link";

const schema = z.object({
  id: z.string(),
  type: z.number(),
  name: z.string().nullable(),
  noIm: z.string().nullable(),
  imId: z.string().nullable(),
  jumlah: z.number(),
  biaya: z.string(),
})

type Schema = z.infer<typeof schema>

const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipe' />
    ),
    cell: ({ row }) => {
      return (
        <span className='truncate font-medium sm:max-w-1 md:max-w-[1rem]'>
          {row.getValue('type') === 0 ? "Barang" : row.getValue('type') === 1 ? 'Bukan barang' : ''}
        </span>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => {
      const isUser = window.location.pathname.split("/")[1] === 'permintaan' ? true : false
      return (
        <div className="space-y-2">
          <p>{row.getValue('name')}</p>
          {

            row.original.noIm &&
            <div className="flex space-x-3">
              <p className="font-semibold">No IM: </p>
              <Link href={`${isUser ? '/permintaan/barang/' : '/permintaan-barang/'}${row.original.imId}`}>
                <p className="text-blue-600 font-semibold">{row.original.noIm}</p>
              </Link>
            </div>
          }
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'jumlah',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jumlah' />
    ),
    cell: ({ row }) => {
      if (row.getValue("jumlah") === 'Total') {
        return <p className="text-right font-semibold">{row.getValue("jumlah")}</p>
      }
      return (
        <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
          {row.getValue('jumlah')}
        </p>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'biaya',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Biaya' />
    ),
    cell: ({ row }) => {
      return (
        <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
          {row.getValue('biaya')}
        </span>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

export default function TableKomponen({ data }: { data: RouterOutputs['perbaikan']['get']['components'] }) {
  return (
    <DataTable
      // @ts-ignore
      data={data}
      // @ts-ignore
      columns={columns}
      isPagintation={false}
    />
  )
}