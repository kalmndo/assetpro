"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod";
import { useEffect, useState } from "react";
import { api, RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchSelect from "@/components/search-select";
import { SelectProps } from "@/lib/type";

const formSchema = z.object({
  "type": z.string().min(1).max(255),
  "catatan": z.string().min(1).max(255),
  "vendorId": z.string(),
})

const TheForm = ({
  isPending,
  onSubmit,
  vendors
}: {
  isPending: boolean,
  onSubmit(value: any): void,
  vendors: SelectProps[]

}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '0',
      catatan: '',
      vendorId: ''
    },
  })

  const formType = form.watch("type")
  const setValue = form.setValue

  useEffect(() => {
    if (formType === "0") {
      setValue("catatan", '')
      setValue('vendorId', '')
    } else {
      setValue("catatan", '')
      setValue('vendorId', '')
    }
  }, [formType, setValue])

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} >
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Tidak selesai</SelectItem>
                    <SelectItem value="1">Tidak selesai dan kirim ke external</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {formType === '1' &&
            <SearchSelect
              name="vendorId"
              form={form}
              label="Pilih vendor"
              placeholder="Pilih vendor"
              data={vendors}
            />
          }
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
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!form.formState.isDirty || !form.formState.isValid || isPending}
          >
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function TeknisiUndoneDialog({
  id,
  vendors,
  asetId,
  pemohonId
}: {
  id: string,
  vendors: SelectProps[],
  asetId: string
  pemohonId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = api.perbaikan.teknisiUndoneExternal.useMutation()

  const onSubmit = async (v: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({ id, ...v, asetId, pemohonId })
      toast.success(result.message)
      router.refresh()
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant={'outline'}>Tidak Selesai</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tidak selesai</DialogTitle>
          <DialogDescription>
            Apakah kamu yakin untuk menolak permintaan ini?
          </DialogDescription>
        </DialogHeader>
        <TheForm onSubmit={onSubmit} isPending={isPending} vendors={vendors} />
      </DialogContent>
    </Dialog>
  )
}