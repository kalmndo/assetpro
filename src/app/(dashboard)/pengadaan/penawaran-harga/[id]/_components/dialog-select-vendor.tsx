"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns-select-vendor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DialogSelectVendor({
  data,
  open,
  onOpenChange,
  // @ts-ignore
  setBarang
}: {
  data: any,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  open: boolean,
  onOpenChange(): void,
  setBarang: Dispatch<SetStateAction<{
    id: string;
    name: string;
    kode: string;
    image: string;
    uom: string;
    qty: number;
    hargaNego: number;
    jumlahVendor: number;
    vendor: {
      name: string;
      harga: number | null;
      total: number | null;
    }[];
  }[]>>
}) {
  const [harga, setHarga] = useState(data.hargaNego)

  const onChange = (e: any) => {
    setHarga(e.target.value)
  }

  const onSubmit = () => {

    setBarang((prev) => {
      return prev.map((v) => {
        if (v.id === data.id) {
          return {
            ...v,
            hargaNego: harga
          }

        }
        return v
      })
    })
    onOpenChange()
  }

  useEffect(() => {
    if (open) {
      setHarga(data.hargaNego)
    } else {
      setHarga(0)
    }

  }, [open, setHarga, data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Penawaran Harga</DialogTitle>
        </DialogHeader>
        <p>Silahkan input harga negosiasi untuk barang <span className="font-semibold">{data.name}</span></p>
        <div className="flex justify-between">
          <div className="space-y-1">
            <Label className="font-semibold">Harga penawaran</Label>
            <Input
              type="number"
              className="w-[300px]"
              placeholder="Input Harga Satuan"
              value={harga}
              onChange={onChange}
            />
          </div>
          <div className="space-y-1 text-right">
            <Label className="font-semibold">Harga penawaran total</Label>
            <p>Rp {(data.qty * harga).toLocaleString("id-ID")}</p>
          </div>
        </div>
        <DataTable
          // @ts-ignore
          data={data?.vendor ?? []}
          // @ts-ignore
          columns={columns}
          isPagintation={false}
        />

        <DialogFooter>
          <Button
            type="submit"
            size="lg"
            onClick={onSubmit}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}