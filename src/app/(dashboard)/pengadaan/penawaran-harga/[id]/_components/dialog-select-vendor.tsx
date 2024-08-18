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
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/currency-input";
import { type Row } from "@tanstack/react-table";
import { type RouterOutputs } from "@/trpc/react";
import { STATUS } from "@/lib/status";


const renderSubComponent = ({ row }: { row: Row<RouterOutputs['penawaranHarga']['get']['barang'][0]['vendor'][0]> }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div >
        <p className="font-semibold">Catatan</p>
        <p className="text-sm">{row.original.catatan}</p>
      </div>
      <div >
        <p className="font-semibold">Termin pembayaran & waktu pengiriman</p>
        <p className="text-sm">{row.original.termin}</p>
      </div>
      <div >
        <p className="font-semibold">Garansi</p>
        <p className="text-sm">{row.original.garansi}</p>
      </div>
    </div>
  )
}

export default function DialogSelectVendor({
  data,
  open,
  onOpenChange,
  // @ts-ignore
  setBarang,
  status,
  canSend
}: {
  data: any,
  status: string
  canSend: boolean
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
      catatan: string | null,
      garansi: string | null,
      termin: string | null
    }[];
  }[]>>
}) {
  const [harga, setHarga] = useState(data.hargaNego)

  const onChange = (e: any) => {
    setHarga(e)
  }

  const onSubmit = () => {

    setBarang((prev) => {
      return prev.map((v) => {
        if (v.id === data.id) {
          return {
            ...v,
            hargaNego: Number(harga)
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
            <CurrencyInput
              name="input-name"
              placeholder="Rp ..."
              onValueChange={onChange}
              disabled={!canSend || status === STATUS.SELESAI.id}
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
          getIsRowExpanded={() => true}
          getRowCanExpand={() => true}
          renderSubComponent={renderSubComponent}
        />

        <DialogFooter>
          {
            status !== STATUS.SELESAI.id && <Button
              type="submit"
              size="lg"
              onClick={onSubmit}
              disabled={!harga}
            >
              Simpan
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}