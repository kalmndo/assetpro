import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { type CartType } from "@/data/cart";
import { type SetStateAction } from "jotai";
import { useState } from "react";
import { type Content } from "@tiptap/react";

export function DeskripsiDialog({
  barang,
  setCart,
}: {
  barang: CartType;
  setCart: (args_0: SetStateAction<CartType>) => void;
}) {
  const [value, setValue] = useState<Content>(barang?.deskripsi);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Input deskripsi</Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Input deskripsi</DialogTitle>
          <DialogDescription>
            Deskripsi untuk ({barang?.name})
          </DialogDescription>
          <MinimalTiptapEditor
            value={value}
            onChange={setValue}
            throttleDelay={0}
            className={cn("h-full min-h-56 w-full rounded-xl", {})}
            editorContentClassName="overflow-auto h-full flex grow"
            output="html"
            placeholder="Type your description here..."
            editable={true}
            editorClassName="focus:outline-none px-5 py-4 h-full grow"
          />
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              setCart((prev: any) => {
                return {
                  ...prev,
                  deskripsi: value,
                };
              });
              setOpen(false);
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
