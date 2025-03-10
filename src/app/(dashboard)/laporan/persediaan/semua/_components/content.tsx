"use client";

import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export default function Content() {
  const { data, mutate, isPending } = api.laporan.semuaStock.useMutation({});

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
    });
  };

  return (
    <div className="py-4">
      <div className="flex items-center gap-4">
        <CalendarDatePicker
          date={date}
          onDateSelect={({ from, to }) => {
            // eslint-disable-next-line
            // @ts-ignore
            setDate({ from, to });
          }}
          variant="outline"
        />
        <Button onClick={onSubmit} disabled={isPending}>
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
              id: "name",
              header: "Unit Business",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.name}
                  </span>
                );
              },
            },
            {
              id: "stockAwal",
              header: "Stock Awal",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.stockAwal.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "masuk",
              header: "Barang Masuk",
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
              header: "Barang Keluar",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.keluar.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "stockAkhir",
              header: "Stock Akhir",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.stockAkhir.toLocaleString("id-ID")}
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
