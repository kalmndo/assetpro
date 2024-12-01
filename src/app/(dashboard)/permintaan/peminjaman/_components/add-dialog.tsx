"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, type RouterOutputs } from "@/trpc/react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form } from "./form";
import { toast } from "sonner";

export const AddDialog = ({
  data,
}: {
  data: RouterOutputs["peminjaman"]["getAll"]["data"];
}) => {
  const router = useRouter();
  const { mutateAsync, isPending } = api.peminjaman.create.useMutation();
  const [open, setOpen] = useState(false);

  async function onSubmit(values: any) {
    try {
      const result = await mutateAsync(values);
      toast.success(result.message);
      router.refresh();
      setOpen(false);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      toast.error(error.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={18} className="mr-1" />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Buat Permintaan Peminjaman </DialogTitle>
        </DialogHeader>
        <Form isPending={isPending} onSubmit={onSubmit} data={data} />
      </DialogContent>
    </Dialog>
  );
};

