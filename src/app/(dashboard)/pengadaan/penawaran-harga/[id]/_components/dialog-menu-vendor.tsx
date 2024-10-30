import SearchSelect from "@/components/search-select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form as OriginalForm,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  "barangId": z.string(),
  "vendorId": z.string(),
})

export default function DialogMenuVendor({
  open,
  onClose
}: {
  open: boolean,
  onClose(): void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barangId: '',
      vendorId: ''
    },
  })

  const onSubmit = () => {

  }

  return (
    <Dialog open={open} onOpenChange={onClose} >
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Input manual vendor</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div>
          <OriginalForm {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="">
              <div className="mt-2 mb-5">
                <SearchSelect
                  data={
                    //   data ? data.map((v) => ({
                    //   label: v.no,
                    //   value: v.id
                    // })) : []
                    []
                  }
                  form={form}
                  label="Barang"
                  name="barangId"
                  placeholder="Pilih Barang"
                />
              </div>
              <div className="mt-2 mb-5">
                <SearchSelect
                  data={
                    //   data ? data.map((v) => ({
                    //   label: v.no,
                    //   value: v.id
                    // })) : []
                    []
                  }
                  form={form}
                  label="Vendor"
                  name="vendorId"
                  placeholder="Pilih Vendor"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </OriginalForm>
        </div>
      </DialogContent>
    </Dialog>
  )
}