import SearchSelect from "@/components/search-select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form as OriginalForm } from "@/components/ui/form";
import { type SelectProps } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  ruangId: z.string().min(1).max(255),
});

interface Props {
  isEdit?: boolean;
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>;
  isPending: boolean;
  value?: any;
  ruangs: SelectProps[];
}

export const Form = ({
  value,
  ruangs,
  isEdit = false,
  onSubmit,
  isPending,
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ruangId: isEdit ? value.ruangId : "",
    },
  });
  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 "
        >
          {!isEdit && (
            <SearchSelect
              data={ruangs}
              form={form}
              label="Ruang"
              name="ruangId"
              placeholder="Pilih Ruang"
            />
          )}
          <DialogFooter>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : isEdit ? (
                "Ubah"
              ) : (
                "Tambah"
              )}
            </Button>
          </DialogFooter>
        </form>
      </OriginalForm>
    </div>
  );
};
