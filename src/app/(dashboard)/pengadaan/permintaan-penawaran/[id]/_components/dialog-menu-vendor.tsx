import SearchSelect from "@/components/search-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form as OriginalForm } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { type RouterOutputs } from "@/trpc/react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  vendorId: z.string(),
});

export default function DialogMenuVendor({
  vendors,
  open,
  onClose,
}: {
  vendors:
    | RouterOutputs["permintaanPenawaran"]["get"]["unsendVendors"]
    | undefined;
  open: boolean;
  onClose(): void;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
    },
  });

  const onSubmit = (values: any) => {
    const pathname = window.location.pathname;

    router.push(`${pathname}/${values.vendorId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Input manual vendor</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <div>
          <OriginalForm {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
              className=""
            >
              <div className="mb-5 mt-2">
                <SearchSelect
                  data={
                    vendors
                      ? vendors.map((v) => ({
                          label: v.name,
                          // @ts-ignore
                          value: v.url,
                        }))
                      : []
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
  );
}
