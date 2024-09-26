import { DataTable } from "@/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { tersediaColumns } from "./tersedia-columns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

function FormDialog({
  open,
  data,
  // eslint-disable-next-line
  onOpenChange,
  setSelection,
}: {
  open: boolean;
  onOpenChange(): void;
  data: any[];
  setSelection: any;
}) {
  const { mutateAsync, isPending } = api.barangKeluar.create.useMutation();
  const router = useRouter();

  const onSubmit = async () => {
    try {
      const result = await mutateAsync(data.map((v) => v.id));
      onOpenChange();
      toast.success(result.message);
      setSelection({});
      router.refresh();
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-scroll sm:max-w-[95%]">
        <DialogHeader>
          <DialogTitle>Buat Form Tanda Keluar Barang</DialogTitle>
          <DialogDescription className="">
            Review ulang tindakan anda, aksi ini tidak dapat di ulang dan
            langsung tersimpan di server
          </DialogDescription>
        </DialogHeader>
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={data.map((_v, i) => `value-${i}`)}
        >
          {data.map((v, i) => (
            <AccordionItem key={i} value={`value-${i}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-[90%] justify-between ">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-sm">
                      <AvatarImage src={v.image} alt="@shadcn" />
                      <AvatarFallback>{getInitials(v.name)}</AvatarFallback>
                    </Avatar>
                    <div className="block text-left text-sm">
                      <p className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                        {v.name}
                      </p>
                      <p className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                        {v.kode}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between py-1 text-right">
                    <p className="text-xs font-medium">
                      {v.imQty} Internal Memo
                    </p>
                    <p className="text-xs font-medium">{v.tersedia} Tersedia</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Pemohon</TableHead>
                      <TableHead className="text-xs">No IM</TableHead>
                      <TableHead className="text-xs">Permintaan</TableHead>
                      <TableHead className="text-right text-xs">
                        Dikirm
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {v.permintaanBarang.map((item: any, i: number) => (
                      <Fragment key={i}>
                        <TableRow>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/permintaan-barang/${item.href}`}
                              className="col-span-2 text-xs font-semibold text-blue-600 hover:underline"
                            >
                              {item.im}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs">{item.qty}</TableCell>
                          <TableCell className="text-right text-xs font-semibold text-green-600">
                            {item.toTransfer} {v.uom}
                          </TableCell>
                        </TableRow>
                        {item.noInventaris?.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-4">
                              <div className="grid gap-2">
                                <p>No Inventaris</p>
                                <div className="flex flex-col space-y-1">
                                  {item.noInventaris.map((v: string) => (
                                    <p
                                      key={v}
                                      className="text-xs font-semibold text-blue-600"
                                    >
                                      {v}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <DialogFooter>
          <Button size="sm" onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Yakin, Setuju"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TersediaTable({ data }: { data: any[] }) {
  const [dialog, setDialog] = useState({ open: false, data: [] });
  function handleDialogClose() {
    setDialog({ open: false, data: [] });
  }
  const [selection, setSelection] = useState({});
  const checkboxToolbarActions = [
    {
      title: "Transfer",
      desc: "Buat Form Tanda Keluar Barang",
      handleAction: async (table: any) => {
        const newData = table
          .getFilteredSelectedRowModel()
          .rows.map((v: any) => ({
            ...v.original,
          }));

        setDialog({ open: true, data: newData });
      },
      variant: "default",
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={[
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                // onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                onCheckedChange={(value) => {
                  const shouldSelect = !!value;
                  table.toggleAllPageRowsSelected(false); // Deselect all first

                  // Only select rows that are not disabled
                  table.getRowModel().rows.forEach((row) => {
                    if (row.original.tersedia !== 0) {
                      row.toggleSelected(shouldSelect);
                    }
                  });
                }}
                aria-label="Select all"
                className="translate-y-[2px]"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                disabled={row.original.tersedia === 0}
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
          ...tersediaColumns,
        ]}
        filter={{ column: "name", placeholder: "Nama ..." }}
        checkboxToolbarActions={checkboxToolbarActions}
        rowSelection={selection}
        setRowSelection={setSelection}
      />
      <FormDialog
        data={dialog.data}
        open={dialog.open}
        setSelection={setSelection}
        onOpenChange={handleDialogClose}
      />
    </>
  );
}

