import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { type CartType } from "@/data/cart"
import { type SelectProps } from "@/lib/type"
import { type SetStateAction } from "jotai"
import SearchKodeAnggaran from "./search-kode-anggaran"
import { Circle, Plus, X } from "lucide-react"
import { useState } from "react"

export default function KodeAnggaranDialog({
  cart,
  setCart,
  kodeAnggarans
}: {
  cart: CartType,
  setCart: (args_0: SetStateAction<CartType>) => void,
  kodeAnggarans: SelectProps[]
}) {
  const [kode, setKode] = useState('')
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    setIsHovered(!isHovered);
  };


  const addKodeAnggaran = () => {
    setCart((prev) => {
      return {
        ...prev,
        kodeAnggaran: [kode, ...prev.kodeAnggaran]
      }
    })
    setKode('')
  }

  const remove = (value: string) => () => {
    setCart((prev) => {
      return {
        ...prev,
        kodeAnggaran: prev.kodeAnggaran.filter((v) => v !== value)
      }
    })
  }

  const newData = kodeAnggarans.filter((item) => !cart.kodeAnggaran.includes(item.value));


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='rounded-full w-56'
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
        >
          {cart.kodeAnggaran.length > 0 && !isHovered
            ? cart.kodeAnggaran[0]
            : 'Input kode anggaran'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Kode Anggaran</DialogTitle>
          <DialogDescription>
            Anda bisa menginput lebih dari 1 kode anggaran
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-4 items-center mb-4">
            <div>
              <Avatar className='h-12 w-12 rounded-sm'>
                <AvatarImage src="https://github.com/shadcn.png" alt='@shadcn' />
                <AvatarFallback>SN</AvatarFallback>
              </Avatar>
            </div>
            <div className="grow">
              <p className="text-sm font-semibold">{cart.name}</p>
              <p className="text-sm">{cart.kode}</p>
            </div>
          </div>
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <SearchKodeAnggaran
                value={kode}
                setValue={setKode}
                data={newData}
              />
            </div>
            <div>
              <Button
                disabled={newData.length === 0}
                variant="outline"
                size="icon"
                onClick={addKodeAnggaran}
              >
                <Plus />
              </Button>
            </div>
          </div>
          <div>
            <ul className="py-2">
              {cart.kodeAnggaran.map((v, i) => (
                <li key={i} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Circle size={7} className="mr-4" />
                    {v}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={remove(v)}
                  >
                    <X className="" size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}