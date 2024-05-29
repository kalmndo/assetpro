"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { type Dispatch, type SetStateAction, useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns-select-vendor";
import { Checkbox } from "@/components/ui/checkbox";

export default function DialogSelectVendor({
  data,
  open,
  onOpenChange,
  // @ts-ignore
  setBarang
}: {
  data: any,
  open: boolean,
  onOpenChange(): void,
  setBarang: Dispatch<SetStateAction<{
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
    }[];
  }[]>>
}) {
  const [selection, setSelection] = useState({})

  const onSubmit = async () => {
    setBarang((prev) => prev)
    // setBarang((prev) => {
    //   // @ts-ignore
    //   const value = prev.map((v) => {
    //     if (v.id === data.id) {
    //       // @ts-ignore
    //       const vendorTerpilih = Object.keys(selection).map((index) => v.vendor[index])
    //       console.log("bara", vendorTerpilih)
    //       return {
    //         ...v,
    //       };
    //     }
    //     return v;
    //   })
    //   return prev
    // });

    // setSelection({})
    // onOpenChange()
  };

  // useEffect(() => {
  //   if (open) {
  //     setSelection(vendors.reduce((acc, vendor, index) => {
  //       if (vendorIds.includes(vendor.id)) {
  //         // @ts-ignore
  //         acc[index] = true;
  //       }
  //       return acc;
  //     }, {}))
  //   } else {
  //     setSelection({})
  //   }

  // }, [open, vendorIds, vendors])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Pilih vendor</DialogTitle>
        </DialogHeader>
        <p>Pilih vendor untuk barang {data.name}</p>
        <DataTable

          data={data.vendor ?? []}
          columns={[
            {
              id: 'select',
              cell: ({ row, table }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => {
                    table.toggleAllPageRowsSelected(false)
                    row.toggleSelected(!!value)
                  }
                  }
                  aria-label='Select row'
                  className='translate-y-[2px]'
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
            ...columns
          ]}
          rowSelection={selection}
          setRowSelection={setSelection}
          filter={{ column: 'name', placeholder: 'Nama ...' }}
          columnVisibilityDefaultState={{ kategori: false, subKategori: false, subSubKategori: false }}
        />

        <DialogFooter>
          <Button
            type="submit"
            size="lg"
            onClick={onSubmit}
          >
            Pilih
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}