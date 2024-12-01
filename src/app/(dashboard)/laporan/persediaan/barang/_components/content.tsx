"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { type SelectProps } from "@/lib/type";

export default function Content({ orgs }: { orgs: SelectProps[] }) {
  const { data, mutate, isPending } = api.laporan.stockByOrg.useMutation();
  const [org, setOrg] = useState<string | undefined>(undefined);

  const [date, setDate] = useState({
    from: undefined,
    to: undefined,
  });

  const onSubmit = () => {
    mutate({
      // eslint-disable-next-line
      // @ts-ignore
      from: date.from,
      // eslint-disable-next-line
      // @ts-ignore
      to: date.to,
      // eslint-disable-next-line
      // @ts-ignore
      orgId: org,
    });
  };

  return (
    <div className="py-4">
      <div className="flex items-center gap-4">
        <Select
          onValueChange={(v) => {
            setOrg(v);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Organisasi" />
          </SelectTrigger>
          <SelectContent>
            {orgs.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CalendarDatePicker
          date={date}
          onDateSelect={({ from, to }) => {
            // eslint-disable-next-line
            // @ts-ignore
            setDate({ from, to });
          }}
          variant="outline"
        />
        <Button onClick={onSubmit} disabled={!org && !date}>
          {isPending ? <LoaderCircle className="animate-spin" /> : "Submit"}
        </Button>
      </div>
      <Separator className="my-4" />
      {data && (
        <DataTable
          // @ts-ignore
          data={data}
          columns={[
            {
              id: "code",
              header: "Kode Barang",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.code}
                  </span>
                );
              },
            },
            {
              id: "name",
              header: "Nama",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.name}
                  </span>
                );
              },
            },
            {
              id: "uom",
              header: "Satuan",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.uom}
                  </span>
                );
              },
            },
            {
              id: "awal",
              header: "Stock awal",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.awal.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "masuk",
              header: "Stock masuk",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.masuk.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "keluar",
              header: "Stock keluar",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.keluar.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "akhir",
              header: "Stock akhir",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.akhir.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
          ]}
          isPagintation={false}
        />
      )}
    </div>
  );
}
