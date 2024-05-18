"use client"

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { DataTableRowActions } from "@/components/data-table/row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Eye, Pen, X } from "lucide-react";
import { type RouterOutputs } from "@/trpc/react";
import { useState } from "react";
import DialogRejectBarang from "./dialog-reject-barang";
import { Button } from "@/components/ui/button";
import DialogUpdate from "./dialog-update";
import { type SelectProps } from "@/lib/type";
import DialogApprove from "./dialog-approve";
import { DialogReject } from "./dialog-reject";
import DialogDetail from "./dialog-detail";

const DEFAULT_BARANG_VALUE = {
  id: "",
  name: "",
  jumlah: '',
  uom: {
    id: '',
    name: ''
  },
  qtyUpdate: '',
  uomUpdate: {
    id: '',
    name: ''
  },
  catatan: ''
}

export function Table({
  data,
  modalData
}: {
  data: RouterOutputs['permintaanBarang']['get'],
  modalData: { uom: SelectProps[] }
}) {
  const [barangs, setBarangs] = useState(data.barang)
  const [dialog, setDialog] = useState<{ open: boolean | string, data: any }>({ open: false, data: DEFAULT_BARANG_VALUE })

  const handleRejectBarangClick = (value: any) => () => {
    const isReject = barangs.find((v) => v.id === value.id)?.status === 'to-reject'

    if (isReject) {
      const newBarang = barangs.map((v) => {
        if (v.id === value.id) {
          return {
            ...v,
            status: 'waiting',
          }
        }
        return v
      })

      setBarangs(newBarang)
    } else {
      setDialog({ open: 'reject-barang', data: value })
    }
  }

  const handleUpdateClick = (value: any) => () => {
    setDialog({ open: 'update', data: value })
  }

  const onRejectSubmit = () => {
    const newBarang = barangs.map((v) => {
      if (v.id === dialog.data.id) {
        return {
          ...v,
          status: 'to-reject',
          catatan: dialog.data.catatan,
          qtyUpdate: undefined,
          uomUpdate: {
            id: undefined,
            name: undefined
          }
        }
      }
      return v
    })

    setBarangs(newBarang)
    setDialog({ open: false, data: DEFAULT_BARANG_VALUE })
  }

  const onUpdateSubmit = (value: any) => {
    const a = barangs.find((v) => v.id === dialog.data.id)
    const isSame = value.jumlah === a?.jumlah && value.uomId === a?.uom.id

    let newBarang: RouterOutputs['permintaanBarang']['get']['barang']

    if (isSame) {
      newBarang = barangs.map((v) => {
        if (v.id === dialog.data.id) {
          return {
            ...v,
            catatan: undefined,
            qtyUpdate: undefined,
            uomUpdate: {
              id: undefined,
              name: undefined
            }
          }
        }
        return v
      })
    } else {
      newBarang = barangs.map((v) => {
        if (v.id === dialog.data.id) {
          return {
            ...v,
            catatan: value.catatan,
            qtyUpdate: value.jumlah,
            uomUpdate: {
              id: value.uomId,
              name: modalData.uom.find((v) => v.value === value.uomId)?.label
            }
          }
        }
        return v
      })
    }

    setBarangs(newBarang)
    setDialog({ open: false, data: DEFAULT_BARANG_VALUE })
  }

  const handleDialogClose = () => {
    setDialog({ open: false, data: DEFAULT_BARANG_VALUE })
  }

  const isAllBarangReject = barangs.every((v) => v.status === 'to-reject')

  return (
    <div>
      <DataTable
        data={barangs as any}
        columns={[
          ...columns,
          {
            id: 'actions',
            cell: ({ row }: { row: any }) => (
              <DataTableRowActions variant={'outline'}>
                <DropdownMenuItem className="space-x-4" onSelect={() => setDialog({ open: 'detail', data: row.original })}>
                  <Eye size={14} />
                  <p className="text-sm">Detail</p>
                </DropdownMenuItem>
                {data.canUpdate && row.original.status !== 'to-reject' &&
                  <DropdownMenuItem
                    className="space-x-4" onSelect={handleUpdateClick(row.original)}>
                    <Pen size={14} />
                    <p className="text-sm">Ubah</p>
                  </DropdownMenuItem>
                }
                {data.canUpdate && <DropdownMenuItem className="space-x-4" onSelect={handleRejectBarangClick(row.original)}>
                  <X size={14} />
                  <p className="text-sm">{row.original.status === 'to-reject' ? 'Batal' : "Tolak"}</p>
                </DropdownMenuItem>}
              </DataTableRowActions>
            ),
            enableSorting: false,
            enableHiding: false,
          }
        ]}
        isPagintation={false}
      />
      {data.canUpdate && <div className="flex justify-end mt-4 gap-4">
        <Button
          variant="outline"
          size="lg"
          className="text-destructive hover:text-destructive"
          onClick={() => setDialog({ open: 'reject', data: DEFAULT_BARANG_VALUE })}
        >
          Tolak
        </Button>
        {!isAllBarangReject && <Button size="lg" onClick={() => setDialog({ open: 'approve', data: DEFAULT_BARANG_VALUE })}>Setuju</Button>}
      </div>}
      <DialogRejectBarang
        open={dialog.open === 'reject-barang'}
        name={dialog.data?.name}
        onSubmit={onRejectSubmit}
        onOpenChange={handleDialogClose}
      />
      <DialogUpdate
        open={dialog.open === 'update'}
        uoms={modalData.uom}
        barang={dialog.data}
        onSubmit={onUpdateSubmit}
        onOpenChange={handleDialogClose}
      />
      <DialogApprove
        open={dialog.open === 'approve'}
        id={data.id}
        barangs={barangs}
        onOpenChange={handleDialogClose}
      />
      <DialogReject
        id={data.id}
        open={dialog.open === 'reject'}
        onOpenChange={handleDialogClose}
      />
      <DialogDetail
        open={dialog.open === 'detail'}
        onOpenChange={handleDialogClose}
      />
    </div>
  )
}