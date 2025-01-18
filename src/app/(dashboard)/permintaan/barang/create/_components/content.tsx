"use client";
import { useAtom } from "jotai";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cartsAtom, cartsAtomsAtom } from "@/data/cart";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import SearchSelect from "@/components/search-select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { type SelectProps } from "@/lib/type";
import Barang from "./barang";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { RESET } from "jotai/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import UplaodImage from "./upload-image";

const formSchema = z.object({
  perihal: z.string().min(1).max(9999),
  ruangId: z.string(),
  peruntukan: z.string().min(1).max(255),
  formPerbaikan: z.string().optional()
});

export default function Content({
  peruntukan,
  formPerbaikans,
  kodeAnggarans,
  ruangs,
}: {
  kodeAnggarans: SelectProps[];
  ruangs: SelectProps[];
  peruntukan: SelectProps[];
  formPerbaikans: SelectProps[];
}) {
  const [cartAtoms, dispatch] = useAtom(cartsAtomsAtom);
  const [barang, setBarang] = useAtom(cartsAtom);
  const { mutateAsync, isPending } = api.permintaanBarang.create.useMutation();
  const router = useRouter();
  const [kodes, setKodes] = useState(kodeAnggarans)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      perihal: "",
      ruangId: "",
      peruntukan: "0",
    },
  });

  useEffect(() => {
    console.log("effect 1")
    if (form.watch("formPerbaikan")) {
      console.log("effect 2")

      const asdf = formPerbaikans.find((v) => v.value === form.watch("formPerbaikan"))
      // @ts-ignore
      setKodes(asdf?.kodeAnggarans)
    }

  }, [form.watch("formPerbaikan")])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (barang.every((v: any) => v.kodeAnggaran.length > 0)) {
      try {
        const result = await mutateAsync({
          ...values,
          barang,
        });

        toast.success(result.message);
        form.reset();
        setBarang(RESET);
        router.replace(`/permintaan/barang/${result.data.id}`);
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        toast.error(error.message);
      }
    } else {
      toast.error("Wajib input kode anggaran");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 "
        >
          {peruntukan.length > 1 && (
            <div className="w-60">
              <SearchSelect
                data={peruntukan}
                form={form}
                label="Peruntukan"
                name="peruntukan"
                placeholder="Pilih Peruntukan"
              />
            </div>
          )}
          {form.watch("peruntukan") !== '2' ?
            <div className="flex space-x-4">
              <div className="w-60">
                <SearchSelect
                  data={ruangs}
                  form={form}
                  label="Ruang"
                  name="ruangId"
                  placeholder="Pilih Ruang "
                />
              </div>
            </div>
            :
            <div className="flex space-x-4">
              <div className="w-60">
                <SearchSelect
                  data={formPerbaikans}
                  form={form}
                  label="Form perbaikan"
                  name="formPerbaikan"
                  placeholder="Pilih Form perbaikan "
                />
              </div>
            </div>
          }

          <FormField
            control={form.control}
            name="perihal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perihal dan Tujuan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Perihal dan tujuan"
                    className=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <UplaodImage /> */}
          <Table className="mt-10">
            <TableHeader>
              <TableRow>
                <TableHead>Barang</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="">Satuan</TableHead>
                <TableHead className="w-40">jumlah</TableHead>
                <TableHead className="w-80 ">Kode Anggaran</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartAtoms.map((cartAtom: any, i) => (
                <Barang
                  key={i}
                  kodeAnggarans={kodes}
                  cartAtom={cartAtom}
                  remove={() => dispatch({ type: "remove", atom: cartAtom })}
                />
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end">
            <Button disabled={isPending} type="submit" className=" my-4">
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Buat permohonan"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

