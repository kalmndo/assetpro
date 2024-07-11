"use client"

import { DataTable } from "@/components/data-table";
import { type RouterOutputs } from "@/trpc/react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type Row } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Fragment } from "react";
import Link from "next/link";

const renderSubComponent = ({ row }: { row: Row<RouterOutputs['barangKeluar']['get']['persediaan'][0]> }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Pemohon</TableHead>
          <TableHead className="text-xs">No IM</TableHead>
          <TableHead className="text-xs">Jumlah</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {row.original.pemohon.map((item: any, i: number) => (
          <Fragment key={i}>
            <TableRow >
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <Link href={`/permintaan-barang/${item.imId}`} className="col-span-2 text-blue-600 font-semibold text-xs hover:underline">
                  {item.noIm}
                </Link>
              </TableCell>
              <TableCell className="text-xs">{item.qty} {row.original.uom}</TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  )
}

export default function Persediaan({ data }: { data: RouterOutputs['barangKeluar']['get']['persediaan'] }) {
  return (
    <>
      <DataTable
        // @ts-ignore
        data={data}
        columns={[
          // @ts-ignore
          ...columns,
          {
            id: 'expander',
            // @ts-ignore
            header: () => null,
            // @ts-ignore
            cell: ({ row }) => {
              return row.getCanExpand() ? (
                <Button
                  variant={'ghost'}
                  size={'icon'}
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                  }}
                >
                  {row.getIsExpanded() ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              ) : (
                'a'
              )
            }
          },
        ]}
        isPagintation={false}
        getRowCanExpand={() => true}
        renderSubComponent={renderSubComponent}

      />
    </>
  )
}