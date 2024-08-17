"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function SelectAsetDialog({
  id,
  data,
  jumlah
}: {
  id: string
  data: RouterOutputs['peminjaman']['get']['listAvailableAsets'],
  jumlah: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selection, setSelection] = useState({})
  const { mutateAsync, isPending } = api.peminjaman.approveAset.useMutation()

  const onSubmit = async () => {
    // @ts-ignore
    const asetIds = Object.keys(selection).map((i) => data[i].id)
    try {
      const result = await mutateAsync({ id, asetIds })

      setOpen(false)
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message)
    }
  };

  const selectionCount = Object.keys(selection).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Setuju</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Pilih Aset</DialogTitle>
          <p className="text-sm">Pastikan sudah konfirmasi dengan pengguna aset tersebut</p>
          <p className="text-sm">Pilih <span className="font-semibold">{jumlah}</span> aset</p>
        </DialogHeader>
        <DataTable
          data={data}
          columns={[
            {
              id: 'select',
              header: ({ table, }) => (
                <Checkbox
                  disabled={true}
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
              cell: ({ row }) => (
                <Checkbox
                  disabled={row.getIsSelected() ? false : selectionCount === jumlah}
                  // disabled={selectionCount === jumlah}
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label='Select row'
                  className='translate-y-[2px]'
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
            {
              id: "no",
              header: ({ column }) => (
                <DataTableColumnHeader column={column} title='No Inventaris' />
              ),
              cell: ({ row }) => {
                return (
                  <div className={`flex space-x-4 items-center`}>
                    <p className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                      {row.original.id}
                    </p>
                  </div>
                )
              },
              enableSorting: false,
              enableHiding: false,
            },
            {
              id: 'pengguna',
              header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Pengguna' />
              ),
              cell: ({ row }) => {
                return (
                  <div className='flex space-x-4'>
                    <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
                      {row.original.Pengguna?.name}
                    </span>
                  </div>
                )
              },
              enableSorting: false,
              enableHiding: false,
            },
            {
              id: 'ruang',
              header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Ruang' />
              ),
              // TODO: Ruang
              cell: ({ row }) => {
                return (
                  <div className='flex space-x-4'>
                    <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
                      Ruangan
                    </span>
                  </div>
                )
              },
              enableSorting: false,
              enableHiding: false,
            },

          ]}
          rowSelection={selection}
          setRowSelection={setSelection}
          filter={{ column: 'no', placeholder: 'No Inventaris ...' }}
          columnVisibilityDefaultState={{ kategori: false, subKategori: false, subSubKategori: false }}
        />
        <DialogFooter>
          <Button
            disabled={selectionCount !== jumlah || isPending}
            type="submit"
            size="lg"
            onClick={onSubmit}
          >
            {isPending ?
              <LoaderCircle className="animate-spin" />
              : 'Pilih'
            }

          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}