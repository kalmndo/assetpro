"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns-select-vendor";
import { Checkbox } from "@/components/ui/checkbox";
import { type Row } from "@tanstack/react-table";
import { type RouterOutputs } from "@/trpc/react";

const renderSubComponent = ({
  row,
}: {
  row: Row<RouterOutputs["penawaranHarga"]["get"]["barang"][0]["vendor"][0]>;
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col space-y-2">
        <div>
          <p className="font-semibold">Catatan</p>
          <p className="text-sm">{row.original.catatan}</p>
        </div>
        <div>
          <p className="font-semibold">Termin pembayaran & waktu pengiriman</p>
          <p className="text-sm">{row.original.termin}</p>
        </div>
        <div>
          <p className="font-semibold">Garansi</p>
          <p className="text-sm">{row.original.garansi}</p>
        </div>
      </div>
      {/* <div> */}
      {/*   <p className="font-semibold">Harga Sebelumnya</p> */}
      {/*   <p className="text-sm"> */}
      {/*     Rp {row.original.prevHarga?.toLocaleString("id-ID")} */}
      {/*   </p> */}
      {/* </div> */}
    </div>
  );
};

export default function DialogSelectVendor({
  data,
  open,
  // eslint-disable-next-line
  onOpenChange,
  canApprove,
  // @ts-ignore
  setBarang,
}: {
  data: any;
  open: boolean;
  canApprove: boolean;
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
        vendorTerpilihId: string;
        vendorTerpilih: string;
        vendorTerpilihHarga: number;
        vendorTerpilihTotal: number;
        vendor: {
          id: string;
          name: string;
          harga: number | null;
          total: number | null;
          prevHarga: number | null;
        }[];
      }[]
    >
  >;
}) {
  // submit dissabled if there is no selection
  const [selection, setSelection] = useState({});

  const onSubmit = async () => {
    const vendorTerpilih = data.vendor[Number(Object.keys(selection)[0])];
    setBarang((prev) => {
      const value = prev.map((v) => {
        if (v.id === data.id) {
          return {
            ...v,
            vendorTerpilihId: vendorTerpilih.id,
            vendorTerpilih: vendorTerpilih.name,
            vendorTerpilihHarga: vendorTerpilih.harga,
            vendorTerpilihTotal: vendorTerpilih.total,
          };
        }
        return v;
      });
      return value;
    });
    setSelection({});
    onOpenChange();
  };

  useEffect(() => {
    if (data.selectionDefault) {
      setSelection(data.selectionDefault);
    }
  }, [data.selectionDefault, setSelection]);

  const unchecked = Object.keys(selection)[0] === "-1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-scroll sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Pilih vendor</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div>
          <p>Pilih vendor untuk barang {data.name}</p>
          <p className="my-2 text-sm font-semibold">Negosiasi</p>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold">Catatan</p>
              <p className="text-sm ">{data.nego?.catatan}</p>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-3">
                <p className="text-sm font-semibold">Termin pembayaran</p>
                <p className="text-sm ">{data.nego?.termin}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-semibold">Waktu pengiriman</p>
                <p className="text-sm ">{data.nego?.delivery}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-semibold">Garansi</p>
                <p className="text-sm ">{data.nego?.garansi}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-semibold">Harga</p>
                <p className="text-sm ">
                  Rp {data.nego?.harga.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DataTable
          data={data.vendor ?? []}
          columns={[
            {
              id: "select",
              cell: ({ row, table }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => {
                    table.toggleAllPageRowsSelected(false);
                    row.toggleSelected(!!value);
                  }}
                  aria-label="Select row"
                  className="translate-y-[2px]"
                  disabled={!canApprove}
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
            // @ts-ignore
            ...columns,
          ]}
          isPagintation={false}
          rowSelection={selection}
          setRowSelection={setSelection}
          // filter={{ column: "name", placeholder: "Nama ..." }}
          columnVisibilityDefaultState={{
            kategori: false,
            subKategori: false,
            subSubKategori: false,
          }}
          getIsRowExpanded={() => true}
          getRowCanExpand={() => true}
          // @ts-ignore
          renderSubComponent={renderSubComponent}
        />

        <DialogFooter>
          {canApprove && (
            <Button
              type="submit"
              size="lg"
              onClick={onSubmit}
              disabled={unchecked}
            >
              Pilih
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
