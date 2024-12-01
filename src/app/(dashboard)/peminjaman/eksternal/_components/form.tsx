import { CurrencyInput } from "@/components/currency-input";
import SearchSelect from "@/components/search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as OriginalForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  type: z.string().min(1).max(255),
  barangId: z.string().min(1),
  ruangId: z.string().min(1),
  peminjam: z.string().min(1),
  peruntukan: z.string().min(1),
  biaya: z.string().min(1),
  jumlah: z.string().min(1),
  tglPinjam: z.date(),
  jamPinjam: z.string(),
  tglKembali: z.date(),
  jamKembali: z.string(),
});

const timeSlots = [
  "07:00",
  "07:15",
  "07:30",
  "07:45",
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
  "21:00",
  "21:15",
  "21:30",
  "21:45",
];

interface Props {
  data: RouterOutputs["peminjaman"]["getAll"]["data"];
  onSubmit(values: z.infer<typeof formSchema>): Promise<void>;
  isPending: boolean;
}

export const Form = ({ data, onSubmit, isPending }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "0",
      barangId: "",
      ruangId: "",
      peminjam: "",
      peruntukan: "",
      jumlah: "0",
    },
  });

  const formType = form.watch("type");
  const setValue = form.setValue;

  useEffect(() => {
    if (formType === "0") {
      setValue("barangId", "1");
      setValue("ruangId", "");
      setValue("jumlah", "0");
    } else {
      setValue("ruangId", "1");
      setValue("barangId", "");
      setValue("jumlah", "");
    }
  }, [formType, setValue]);

  return (
    <div className="relative">
      <OriginalForm {...form}>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 space-y-4">
              <div className="">
                <SearchSelect
                  data={[
                    { label: "Ruang", value: "0" },
                    { label: "Barang", value: "1" },
                  ]}
                  form={form}
                  label="Tipe"
                  name="type"
                  placeholder="Pilih tipe"
                />
              </div>
              {formType === "0" ? (
                <div className="">
                  <SearchSelect
                    data={data.ruangs.map((v) => ({
                      label: v.label,
                      value: v.value,
                    }))}
                    form={form}
                    label="Pilih ruang"
                    name="ruangId"
                    placeholder="Pilih ruang"
                  />
                </div>
              ) : (
                <>
                  <div className="">
                    <SearchSelect
                      data={data.barangs}
                      form={form}
                      label="Barang"
                      name="barangId"
                      placeholder="Barang"
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="jumlah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Jumlah"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              <div>
                <FormField
                  control={form.control}
                  name="biaya"
                  render={({}) => (
                    <FormItem>
                      <FormLabel>Biaya</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          // {...field}
                          placeholder="Rp ..."
                          onValueChange={(_v, _n, value) => {
                            form.setValue("biaya", value!.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="peminjam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peminjam</FormLabel>
                      <FormControl>
                        <Input placeholder="Peminjam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="peruntukan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peruntukan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Peruntukan"
                          className=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="col-span-1">
              <p className="mb-2 text-sm font-medium">Tanggal peminjaman</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="tglPinjam"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "LLL dd, y")
                                ) : (
                                  <span>Pilih Tanggal</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="">
                  <SearchSelect
                    data={timeSlots.map((v) => ({ value: v, label: v }))}
                    form={form}
                    // label="Jam"
                    name="jamPinjam"
                    placeholder="Jam"
                  />
                </div>
              </div>
              <p className="mb-2 mt-5 text-sm font-medium">
                Tanggal pengembalian
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="tglKembali"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={!form.watch("tglPinjam")}
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "LLL dd, y")
                                ) : (
                                  <span>Pilih Tanggal</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="">
                  <SearchSelect
                    // data={timeSlots.map((v) => ({ value: v, label: v }))}
                    data={
                      form.watch("jamPinjam") &&
                      form.watch("tglPinjam") &&
                      form.watch("tglKembali")
                        ? form.watch("tglPinjam").toISOString() ===
                          form.watch("tglKembali").toISOString()
                          ? timeSlots
                              .filter((slot) => slot > form.watch("jamPinjam"))
                              .map((v) => ({ value: v, label: v }))
                          : timeSlots.map((v) => ({ value: v, label: v }))
                        : []
                    }
                    form={form}
                    // label="Jam"
                    name="jamKembali"
                    placeholder="Jam"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button disabled={isPending} type="submit">
              {isPending ? <LoaderCircle className="animate-spin" /> : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </OriginalForm>
    </div>
  );
};
