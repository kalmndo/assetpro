"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react";
import { useState } from "react";
import TakTersediaTable from "./tak-tersedia-table";
import TersediaTable from "./tersedia-table";

export default function Content({ tersedia, takTersedia }: { tersedia: any[], takTersedia: any[] }) {
  const [position, setPosition] = useState('tersedia')
  return (
    <>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            Permintaan Barang
          </h1>
          <p className='text-muted-foreground'>
            List permintaan barang yang <span className="font-semibold">{position === 'tersedia' ? '(Tersedia)' : "(Tidak Tersedia)"}</span>.
          </p>
        </div>
        <div className="">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <Filter size={14} className="mr-2" />
                {position === 'tersedia' ? "Tersedia" : "Tidak Tersedia"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                <DropdownMenuRadioItem value="tersedia">Tersedia</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="takTersedia">Tidak Tersedia</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {position === 'tersedia'
        ?
        <TersediaTable data={tersedia} />
        :
        <TakTersediaTable data={takTersedia} />
      }
    </>
  )
}