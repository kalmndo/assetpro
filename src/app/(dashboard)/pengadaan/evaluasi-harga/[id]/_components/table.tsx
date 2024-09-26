"use client";

import { DataTable } from "@/components/data-table";
import { type RouterOutputs } from "@/trpc/react";
import { columns } from "./columns";
import DialogSelectVendor from "./dialog-select-vendor";
import { DataTableRowActions } from "@/components/data-table/row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import ApproveDialog from "./approve-dialog";

export function Table({
  data,
}: {
  data: RouterOutputs["evaluasiHarga"]["get"];
}) {
  const [barang, setBarang] = useState(data.barang);
  const [dialog, setDialog] = useState({
    open: false,
    data: {} as typeof data,
  });

  const handleCloseDialog = () => {
    setDialog({ open: false, data: {} as typeof data });
  };

  return (
    <div>
      <DataTable
        data={barang as any}
        columns={[
          ...columns,
          {
            id: "actions",
            cell: ({ row }) => (
              <DataTableRowActions>
                <DropdownMenuItem
                  onSelect={() => {
                    // @ts-ignore
                    const vendorTerpilihIndex = row.original.vendor
                      // @ts-ignore
                      ?.map((v: any) => v.id)
                      .findIndex(
                        // @ts-ignore
                        (id: any) => id === row.original.vendorTerpilihId,
                      );
                    setDialog({
                      open: true,
                      data: {
                        ...row.original,
                        // @ts-ignore
                        selectionDefault: { [vendorTerpilihIndex]: true },
                      },
                    });
                  }}
                >
                  Pilih Vendor
                </DropdownMenuItem>
              </DataTableRowActions>
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]}
        isPagintation={false}
      />
      <DialogSelectVendor
        open={dialog.open}
        data={dialog.data}
        canApprove={data.canApprove}
        onOpenChange={handleCloseDialog}
        setBarang={setBarang as any}
      />
      <div className="flex justify-end py-4">
        {data.canApprove && <ApproveDialog id={data.id} barang={barang} />}
      </div>
      {data.riwayat.length > 0 && (
        <div className="">
          <p className="font-semibold">Riwayat</p>
          {data.riwayat.map((v) => {
            return (
              <div key={v.id} className="mt-4">
                <div className="text-sm font-semibold">{v.name}</div>
                <div className="mt-2">
                  {v.barang.map((va) => (
                    <div key={va.kode}>
                      <p className="text-sm font-semibold">{va.name}</p>
                      <p className="text-sm">{va.vendor.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

