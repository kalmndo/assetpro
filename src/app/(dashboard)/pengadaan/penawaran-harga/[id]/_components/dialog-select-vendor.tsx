"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns-select-vendor";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/currency-input";
import { type Row } from "@tanstack/react-table";
import { type RouterOutputs } from "@/trpc/react";
import { STATUS } from "@/lib/status";
import { Input } from "@/components/ui/input";

const renderSubComponent = ({
  row,
}: {
  row: Row<RouterOutputs["penawaranHarga"]["get"]["barang"][0]["vendor"][0]>;
}) => {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4 space-y-4">
        <div>
          <p className="font-semibold">Termin pembayaran </p>
          <p className="text-sm">{row.original.termin}</p>
        </div>
        <div>
          <p className="font-semibold">Waktu pengiriman</p>
          <p className="text-sm">{row.original.delivery}</p>
        </div>
      </div>
      <div className="col-span-4 space-y-4">
        <div>
          <p className="font-semibold">Garansi</p>
          <p className="text-sm">{row.original.garansi}</p>
        </div>
        <div>
          <p className="font-semibold">Catatan</p>
          <p className="text-sm">{row.original.catatan}</p>
        </div>
      </div>
    </div>
  );
};

export default function DialogSelectVendor({
  data,
  open,
  // eslint-disable-next-line
  onOpenChange,
  // @ts-ignore eslint-disable-next-line
  setBarang,
  status,
  canSend,
}: {
  data: any;
  status: string;
  canSend: boolean;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  open: boolean;
  onOpenChange(): void;
  setBarang: Dispatch<
    SetStateAction<
      {
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
          catatan: string | null;
          garansi: string | null;
          termin: string | null;
          delivery: string | null;
        }[];
      }[]
    >
  >;
}) {
  const [harga, setHarga] = useState(data.hargaNego);
  const [termin, setTermin] = useState(data.hargaNego);
  const [delivery, setDelivery] = useState(data.hargaNego);
  const [garansi, setGaransi] = useState(data.hargaNego);
  const [catatan, setCatatan] = useState(data.hargaNego);

  const onChange = (e: any) => {
    setHarga(e);
  };

  const onSubmit = () => {
    setBarang((prev) => {
      return prev.map((v) => {
        if (v.id === data.id) {
          return {
            ...v,
            hargaNego: Number(harga),
            termin,
            delivery,
            garansi,
            catatan,
          };
        }
        return v;
      });
    });
    onOpenChange();
  };

  useEffect(() => {
    if (open) {
      setHarga(data.hargaNego);
    } else {
      setHarga(0);
    }
  }, [open, setHarga, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Penawaran Harga</DialogTitle>
        </DialogHeader>
        <p>
          Silahkan input harga negosiasi untuk barang{" "}
          <span className="font-semibold">{data.name}</span>
        </p>
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
          <div className="space-y-1">
            <Label className="font-semibold">Termin pembayaran</Label>
            <Input
              value={termin}
              placeholder="Termin"
              onChange={(e) => {
                setTermin(e.target.value);
              }}
              disabled={!canSend || status === STATUS.SELESAI.id}
            />
          </div>
          <div className="space-y-1">
            <Label className="font-semibold">Waktu pengiriman</Label>
            <Input
              value={delivery}
              placeholder="Waktu pengiriman"
              onChange={(e) => {
                setDelivery(e.target.value);
              }}
              disabled={!canSend || status === STATUS.SELESAI.id}
            />
          </div>
          <div className="space-y-1">
            <Label className="font-semibold">Garansi</Label>
            <Input
              value={garansi}
              placeholder="Garansi"
              onChange={(e) => {
                setGaransi(e.target.value);
              }}
              disabled={!canSend || status === STATUS.SELESAI.id}
            />
          </div>
          <div className="space-y-1 text-right">
            <Label className="font-semibold">Harga penawaran total</Label>
            <p>Rp {(data.qty * harga).toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="w-[400px]">
          <div className="space-y-1">
            <Label className="font-semibold">Catatan</Label>
            <Input
              value={catatan}
              placeholder="Catatan"
              onChange={(e) => {
                setCatatan(e.target.value);
              }}
              disabled={!canSend || status === STATUS.SELESAI.id}
            />
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
          {status !== STATUS.SELESAI.id && (
            <Button
              type="submit"
              size="lg"
              onClick={onSubmit}
              disabled={!harga}
            >
              Simpan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
