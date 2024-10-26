"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Info,
  Menu as MenuIcon,
  Printer,
  TrendingDown,
  UserSearch,
} from "lucide-react";
import { useState } from "react";
import { type RouterOutputs } from "@/trpc/react";

const defaultValue = {
  id: "",
};

export default function Menu({
  id,
}: {
  id: string;
}) {
  const [dialog, setDialog] = useState<{
    data: typeof defaultValue;
    open: boolean | string;
  }>({ data: defaultValue, open: false });

  const onClose = () => {
    setDialog({ data: defaultValue, open: false });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            onSelect={() => setDialog({ data: { id }, open: "qr" })}
          >
            <Printer size={18} className="mr-2" />
            Ubah tanggal
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDialog({ data: { id }, open: "info" })}
          >
            <Info size={18} className="mr-2" />
            Input manual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

