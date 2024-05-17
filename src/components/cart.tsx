"use client"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ShoppingCart, Trash } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useAtom, useAtomValue, type PrimitiveAtom } from "jotai"
import { type CartType, cartsAtomsAtom } from "@/data/cart"
import Link from "next/link"
import { useState } from "react"



function Barang({
  cartAtom,
  remove
}: {
  cartAtom: PrimitiveAtom<CartType>
  remove: () => void
}) {
  const cart = useAtomValue(cartAtom)

  return (
    <div className="flex gap-4 items-center mb-4">
      <div>
        <Avatar className='h-12 w-12 rounded-sm'>
          <AvatarImage src={cart.gambar} alt='@shadcn' />
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
      </div>
      <div className="grow">
        <p className="text-sm font-semibold">{cart.name}</p>
        <p className="text-sm">{cart.kode}</p>
      </div>
      <div>
        <Button
          size='icon'
          variant='ghost'
          className='rounded-full'
          onClick={remove}
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  )

}

export default function Cart() {
  const [open, setOpen] = useState(false)
  const [cartAtoms, dispatch] = useAtom(cartsAtomsAtom)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='rounded-full relative'
        >
          <ShoppingCart size={18} />
          <div className="absolute  text-xs bg-primary rounded-full px-[5px] text-white top-0 right-0">
            {cartAtoms.length}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Keranjang barang permintaan</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when youre done.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-[90%]">
          <ScrollArea className="grow my-4">
            {cartAtoms.map((cartAtom, i) => (
              <Barang
                key={i}
                cartAtom={cartAtom as any}
                remove={() => dispatch({ type: 'remove', atom: cartAtom })}
              />
            ))}

          </ScrollArea>
          <div className="">
            <Link href="/permintaan/barang/create" onClick={() => setOpen(false)} >
              <Button disabled={cartAtoms.length === 0} className="w-full">Buat permintaan</Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}