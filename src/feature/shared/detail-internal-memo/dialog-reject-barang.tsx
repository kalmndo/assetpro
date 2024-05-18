"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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



const formSchema = z.object({
  "catatan": z.string().min(1).max(255),
})

const TheForm = ({
  value,
  onSubmit,
}: {
  value: any,
  onSubmit(value: any): void,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      catatan: value.catatan ?? '',
    },
  })

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
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!form.formState.isDirty || !form.formState.isValid}
          >
            Tolak
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function DialogRejectBarang({
  open,
  barang,
  name,
  onSubmit,
  onOpenChange
}: {
  open: boolean,
  barang: any,
  name: string,
  onSubmit(v: any): void,
  onOpenChange(): void
}) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tolak Barang</DialogTitle>
          <DialogDescription>
            Apakah kamu yakin untuk menolak <span className="font-semibold text-black">{name}?</span>
            <br />
            Wajib isi catatan untuk menolak barang permintaan
          </DialogDescription>
        </DialogHeader>
        <TheForm value={barang} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}