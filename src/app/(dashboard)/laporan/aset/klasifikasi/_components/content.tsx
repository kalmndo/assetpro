"use client";

import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export default function Content() {
  const [kategoriId, setKategori] = useState<undefined | string>(undefined);
  const { data: golongans } = api.mbKategori.getAll.useQuery({
    golonganId: "1",
  });
  const { data, mutate, isPending } =
    api.laporan.semuaAsetPerlokasi.useMutation({});

  const [date, setDate] = useState({
    from: undefined,
    to: undefined,
  });

  const onSubmit = () => {
    mutate({
      kategoriId,
      from: date.from,
      to: date.to,
    });
  };

  return (
    <div className="py-4">
      <div className="flex items-center gap-4">
        <Select onValueChange={setKategori}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {golongans?.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CalendarDatePicker
          date={date}
          onDateSelect={({ from, to }) => {
            setDate({ from, to });
          }}
          variant="outline"
        />
        <Button onClick={onSubmit} disabled={isPending || !kategoriId}>
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
              id: "saldoAwal",
              header: "Saldo Awal",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.saldoAwal.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "penambahan",
              header: "Penambahan",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.penambahan.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "jumlah",
              header: "Jumlah",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.jumlah}
                  </span>
                );
              },
            },
            {
              id: "susut",
              header: "Akm Penyusutan",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.susut.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "saldoAkhir",
              header: "Saldo Akhir",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.saldoAkhir.toLocaleString("id-ID")}
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
