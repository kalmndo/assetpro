"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Info, Menu as MenuIcon, TrendingDown, UserSearch } from "lucide-react";
import { DialogInformasi } from "./dialog-informasi";
import { useState } from "react";
import { DialogPenyusutan } from "./dialog-penyusutan";
import { RouterOutputs } from "@/trpc/react";
import { DialogAudit } from "./dialog-audit";

const defaultValue = {
  id: ""
}

export default function Menu({ id, audit }: { id: string, audit: RouterOutputs['daftarAset']['get']['audit'] }) {
  const [dialog, setDialog] = useState<{ data: typeof defaultValue, open: boolean | string }>({ data: defaultValue, open: false })

  const onClose = () => {
    setDialog({ data: defaultValue, open: false })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onSelect={() => setDialog({ data: { id }, open: 'info' })}><Info size={18} className="mr-2" />Informasi</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog({ data: { id }, open: 'susut' })}><TrendingDown size={18} className="mr-2" /> Penyusutan</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog({ data: { id }, open: 'audit' })}><UserSearch size={18} className="mr-2" /> Audit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogInformasi id={id} open={dialog.open === 'info'} onClose={onClose} />
      <DialogPenyusutan id={id} open={dialog.open === 'susut'} onClose={onClose} />
      <DialogAudit data={audit} open={dialog.open === 'audit'} onClose={onClose} />
    </>
  )
}