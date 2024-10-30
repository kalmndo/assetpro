"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, Menu as MenuIcon, Printer } from "lucide-react";
import { useState } from "react";
import DialogMenuVendor from "./dialog-menu-vendor";
import { type RouterOutputs } from "@/trpc/react";

export default function Menu({
  vendors,
}: {
  vendors: RouterOutputs["permintaanPenawaran"]["get"]["unsendVendors"];
}) {
  const [dialog, setDialog] = useState<{
    data: typeof vendors | undefined;
    open: boolean | string;
  }>({ data: undefined, open: false });

  const onClose = () => {
    setDialog({ data: undefined, open: false });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onSelect={() => console.log("")}>
            <Printer size={18} className="mr-2" />
            Ubah tanggal
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDialog({ data: vendors, open: "manual" })}
          >
            <Info size={18} className="mr-2" />
            Input vendor manual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogMenuVendor
        vendors={vendors}
        open={dialog.open === "manual"}
        onClose={onClose}
      />
    </>
  );
}
