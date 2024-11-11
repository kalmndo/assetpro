"use client"

import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { api } from "@/trpc/react"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"

const tahuns = [
  '2022',
  '2023',
  '2024'
]

export default function Content() {
  const [tahun, setTahun] = useState<undefined | string>(undefined)
  const { data, mutate, isPending } = api.laporan.semuaAset.useMutation({

  })

  const onSubmit = () => {
    mutate({ tahun: Number(tahun) })
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-4" >
        <Select onValueChange={setTahun} >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            {tahuns.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onSubmit} disabled={isPending || !tahun}>{
          isPending ? <LoaderCircle className="animate-spin" /> : "Submit"
        }</Button>
      </div>
      <Separator className="my-4" />
      {data &&
        <DataTable
          // @ts-ignore
          data={data}
          columns={[
            {
              id:"no",
              header: 'No',
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.no}
                  </span>
                );
              },
            },
            {
              id:"name",
              header: 'Nama aset',
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.name}
                  </span>
                );
              },
            },
            {
              id:"thisYear",
              header: `Tahun ${tahun}`,
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.thisYear.toLocaleString('id-ID')}
                  </span>
                );
              },
            },
            {
              id:"lastYear",
              header: `Tahun ${Number(tahun) - 1}`,
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.lastYear.toLocaleString('id-ID')}
                  </span>
                );
              },
            },
            {
              id:"percentage",
              header: '%',
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.percentage} %
                  </span>
                );
              },
            }
          ]}
          isPagintation={false}
        />
      }
    </div>
  )
}