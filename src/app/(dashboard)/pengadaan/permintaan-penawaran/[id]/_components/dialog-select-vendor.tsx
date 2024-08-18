"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { type RouterOutputs } from "@/trpc/react";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns-select-vendor";
import { Checkbox } from "@/components/ui/checkbox";
import { STATUS } from "@/lib/status";

export default function DialogSelectVendor({
  data,
  vendors,
  open,
  onOpenChange,
  vendorIds,
  status,
  // @ts-ignore
  setBarang
}: {
  data: any,
  vendors: RouterOutputs['permintaanPenawaran']['get']['getVendors']
  open: boolean,
  onOpenChange(): void,
  vendorIds: string[],
  status: string
  setBarang: Dispatch<SetStateAction<{
    id: string;
    name: string;
    kode: string;
    image: string;
    uom: string;
    qty: number;
    jumlahVendor: number;
    vendorTerpilih: string[];
  }[]>>
}) {
  const [selection, setSelection] = useState({})

  const onSubmit = async () => {

    setBarang((prev) => {
      // @ts-ignore
      const vendorTerpilih = Object.keys(selection).map((index) => vendors[index].id)
      return prev.map((v) => {
        if (v.id === data.id) {
          return {
            ...v,
            vendorTerpilih,
            jumlahVendor: vendorTerpilih.length
          };
        }
        return v;
      })
    });
    setSelection({})
    onOpenChange()
  };

  useEffect(() => {
    if (open) {
      setSelection(vendors.reduce((acc, vendor, index) => {
        if (vendorIds.includes(vendor.id)) {
          // @ts-ignore
          acc[index] = true;
        }
        return acc;
      }, {}))
    } else {
      setSelection({})
    }

  }, [open, vendorIds, vendors])

  const newColumns = status === STATUS.SELESAI.id
    ?
    columns
    :
    [
      {
        id: 'select',
        // @ts-ignore
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
            }}
            aria-label='Select all'
            className='translate-y-[2px]'
          />
        ),
        // @ts-ignore
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='translate-y-[2px]'
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns
    ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{status === STATUS.SELESAI.id ? "Vendor terpilih" : "Pilih vendor"}</DialogTitle>
        </DialogHeader>
        <p>{status === STATUS.SELESAI.id ? "Vendor terpilih" : "Pilih vendor"} untuk barang {data.name}</p>
        <DataTable
          data={vendors}
          columns={newColumns}
          {...(status !== STATUS.SELESAI.id && { rowSelection: selection, setRowSelection: setSelection })}
          filter={{ column: 'name', placeholder: 'Nama ...' }}
          columnVisibilityDefaultState={{ kategori: false, subKategori: false, subSubKategori: false }}
        />

        <DialogFooter>
          {status !== STATUS.SELESAI.id && <Button
            type="submit"
            size="lg"
            onClick={onSubmit}
          >
            Pilih
          </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}