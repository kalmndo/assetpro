"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { DataTable } from "./table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

const renderSubComponent = ({ row }: { row: any }) => {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">No Inventaris</TableHead>
          <TableHead className="text-xs">Harga pembelian </TableHead>
          <TableHead className="text-xs">Nilai Penyusutan</TableHead>
          <TableHead className="text-xs">Nilai Buku</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {row.original.children.map((item: any, i: number) => (
          <TableRow key={i}>
            <TableCell className="font-medium">
              <Link
                href={`/daftar-aset/${item.noInv.replace(/\//g, "-")}`}
                className="flex w-full"
              >
                <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] text-blue-800">
                  {item.noInv}
                </span>
              </Link>
            </TableCell>
            <TableCell className="font-medium">
              {item.harga}
            </TableCell>
            <TableCell className="font-medium">
              {item.susut}
            </TableCell>
            <TableCell className="font-medium">
              {item.buku}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function Content({ datas }: { datas: any }) {
  const [org, setOrg] = useState<string>('all');
  const [kategoriId, setKategori] = useState<string>('all');
  const [subKategoriId, setSubKategori] = useState<string>('all');
  const [subSubKategoriId, setSubSubKategori] = useState<string>("all");

  const { data, mutate, isPending } =
    api.laporan.jumlah.useMutation();



  const onSubmit = () => {
    mutate({
      kategoriId,
      org,
      subKategoriId,
      subSubKategoriId
    });
  };

  const subKategoris = kategoriId === "all" ? datas.subKategori : datas.subKategori.filter((v: any) => v.parent === kategoriId)
  const subSubkategoris = subKategoriId === "all" ? datas.subSubKategori : datas.subSubKategori.filter((v: any) => v.parent === subKategoriId)

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 mb-4">
        <div>
          <Label>Organisasi</Label>
          <Select onValueChange={setOrg}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              {datas.org?.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-end gap-4">
        <div>
          <Label>Kategori</Label>
          <Select onValueChange={setKategori}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              {datas.kategori?.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sub Kategori</Label>
          <Select onValueChange={setSubKategori}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              {subKategoris.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sub Sub Kategori</Label>
          <Select onValueChange={setSubSubKategori}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              {subSubkategoris.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              id: "aset",
              header: "Aset",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    {row.original.aset}
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
              id: "harga",
              header: "Total harga pembelian",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.harga.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "susut",
              header: "Total penyusutan",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.susut.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "buku",
              header: "Total nilai buku",
              cell: ({ row }) => {
                return (
                  <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                    Rp {row.original.buku.toLocaleString("id-ID")}
                  </span>
                );
              },
            },
            {
              id: "drop",
              // header: "Total nilai buku",
              cell: ({ row }) => {
                return (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={row.getToggleExpandedHandler()}
                  >
                    {row.getIsExpanded() ? <ChevronDown /> : <ChevronUp />}
                  </Button>
                );
              },
            },
          ]}
          // isPagintation={false}
          // getIsRowExpanded={() => true}
          // getRowCanExpand={() => true}
          renderSubComponent={renderSubComponent}
        />
      )}
    </div>
  );
}
