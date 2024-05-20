"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

const data = [
  {
    kategori: 'Permintaan',
    item: [
      {
        title: 'Barang',
        value: 'INV/0006'
      },
      {
        title: 'Perbaikan',
        value: 'INV/0006'
      },
      {
        title: 'Perbaikan Keluar',
        value: 'INV/0006'
      },
      {
        title: 'Peminjaman',
        value: 'INV/0006'
      },
      {
        title: 'Peminjaman Eksternal',
        value: 'INV/0006'
      },
    ]
  },
  {
    kategori: 'Pengadaan',
    item: [
      {
        title: 'Permintaan Pembelian',
        value: 'INV/0006'
      },
      {
        title: 'Permintaan Penawaran',
        value: 'INV/0006'
      },
      {
        title: 'Penawaran Harga',
        value: 'INV/0006'
      },
      {
        title: 'Evaluasi Harga',
        value: 'INV/0006'
      },
      {
        title: 'Purchase Order',
        value: 'INV/0006'
      },
    ]
  },
  {
    kategori: 'Gudang',
    item: [
      {
        title: 'Terima Barang Aset',
        value: 'INV/0006'
      },
      {
        title: 'Terima Barang Persediaan',
        value: 'INV/0006'
      },
      {
        title: 'Keluar Barang Aset',
        value: 'INV/0006'
      },
      {
        title: 'Keluar Barang Persediaan',
        value: 'INV/0006'
      },
      {
        title: 'Mutasi Aset',
        value: 'INV/0006'
      },
      {
        title: 'Transfer Gudang',
        value: 'INV/0006'
      },
    ]
  },
]

function ItemDialog({
  data,
  open,
  onOpenChange
}: {
  data: {
    title: string,
    value: string
  },
  open: boolean,
  onOpenChange(open: boolean): void
}) {
  // penomoran otomatis - dropdown penomoran
  // contoh output penomoran
  // - [ ] apakah penomoran otomatis?
  //  - tidak
  //    

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
        </DialogHeader>
        <div className="">
          <div className="grid grid-cols-3">

          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Content() {
  const [dialog, setDialog] = useState({
    open: false,
    data: { title: '', value: '' }
  })

  const handleCloseDialog = () => {
    setDialog({ open: false, data: { title: '', value: '' } })
  }

  return (
    <div className="p-4">
      {data.map((v, i) => (
        <div key={i}>
          <p className="text-sm font-semibold">{v.kategori}</p>
          <ul className='no-scrollbar grid gap-4 overflow-y-scroll pb-8 pt-4 md:grid-cols-2 lg:grid-cols-4'>
            {v.item.map((a, key) => (
              <div
                onClick={() => {
                  setDialog({ open: true, data: a })
                }}
                key={key}
              >
                <li className='rounded-lg border p-4 hover:shadow-md hover:cursor-pointer'>
                  <div>
                    <p className='text-sm mb-1 font-semibold'>{a.title}</p>
                    <p className='text-sm line-clamp-2 text-gray-500'>{a.value}</p>
                  </div>
                </li>
              </div>
            ))}
          </ul>
        </div>
      ))}
      <ItemDialog
        open={dialog.open}
        data={dialog.data}
        onOpenChange={handleCloseDialog}
      />
    </div>
  )
}