"use client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import SearchSelect from "@/components/search-select";
import { type SelectProps } from "@/lib/type";
import { getInitials } from "@/lib/utils";

const formSchema = z.object({
  "catatan": z.string().min(1).max(255),
  "jumlah": z.string().min(1).max(255),
  "uomId": z.string().min(1).max(255),
})

const TheForm = ({
  isImApprove,
  value,
  onSubmit,
  uoms
}: {
  isImApprove: boolean | undefined
  value: any,
  onSubmit(value: any): void,
  uoms: SelectProps[]
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      catatan: value.catatan ?? '',
      jumlah: value.qtyUpdate ?? value.jumlah,
      uomId: value.uomUpdate?.id ?? value.uom.id,
    },
  })

  function disabled() {
    if (isImApprove) {
      return Number(form.watch("jumlah")) > Number(value.jumlah)
    }

  }

  console.log("disable", disabled())
  console.log("isDirty", !form.formState.isDirty)
  console.log("isValid", !form.formState.isValid)

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} >
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="catatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <Input placeholder="Catatan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jumlah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <Input type='number' placeholder="Jumlah" {...field} />
                </FormControl>
                <FormMessage />
                {isImApprove && <p className="text-xs text-red-400 ">Tidak bisa melebihi jumlah dari {value.jumlah}</p>}
              </FormItem>
            )}
          />
          <SearchSelect
            data={uoms}
            form={form}
            label="Satuan"
            name="uomId"
            placeholder="Pilih Satuan"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!form.formState.isDirty || !form.formState.isValid || disabled()}
          >
            Ubah
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function DialogUpdate({
  open,
  barang,
  isImApprove,
  onSubmit,
  onOpenChange,
  uoms
}: {
  open: boolean,
  barang: any,
  isImApprove: boolean | undefined,
  onSubmit(value: any): void,
  onOpenChange(open: boolean): void,
  uoms: SelectProps[]
}) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-4">Ubah Permintaan Barang</DialogTitle>
          <div className="flex justify-between mt-4">
            <div className="flex gap-4">
              <Avatar className='rounded-sm w-12 h-12'>
                <AvatarImage src={barang.image} alt="@shadcn" />
                <AvatarFallback>{getInitials(barang.name)}</AvatarFallback>
              </Avatar>
              <div className='block'>
                <p className='text-sm max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
                  {barang.name}
                </p>
                <p className='text-sm max-w-32 truncate sm:max-w-72 md:max-w-[31rem]'>
                  {barang.kode}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm">{barang.jumlah} {barang.uom.name}</p>
            </div>
          </div>
        </DialogHeader>
        <TheForm isImApprove={isImApprove} value={barang} onSubmit={onSubmit} uoms={uoms} />
      </DialogContent>
    </Dialog>
  )
}