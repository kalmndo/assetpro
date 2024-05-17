import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { type CartType } from "@/data/cart"
import { type PrimitiveAtom, useAtom } from "jotai"
import { Trash } from "lucide-react"
import KodeAnggaranDialog from "./kode-anggaran-dialog"
import { type SelectProps } from "@/lib/type"

export default function Barang({
  cartAtom,
  remove,
  kodeAnggarans
}: {
  cartAtom: PrimitiveAtom<CartType>,
  remove: () => void,
  kodeAnggarans: SelectProps[]
}) {
  const [cart, setCart] = useAtom(cartAtom)

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex gap-4 items-center mb-4">
          <div>
            <Avatar className='h-12 w-12 rounded-sm'>
              <AvatarImage src="" alt='@shadcn' />
              <AvatarFallback>SN</AvatarFallback>
            </Avatar>
          </div>
          <div className="grow">
            <p className="text-sm font-semibold">{cart.name}</p>
            <p className="text-sm">{cart.kode}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {cart.uom}
      </TableCell>
      <TableCell>
        <Input
          className="w-24"
          value={cart.qty}
          onChange={(e) => {
            setCart((prev) => ({
              ...prev,
              qty: e.target.value
            }))
          }}
          placeholder="0"
          type="number"
        />
      </TableCell>
      <TableCell className="">
        <KodeAnggaranDialog cart={cart} setCart={setCart} kodeAnggarans={kodeAnggarans} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size='icon'
          variant='ghost'
          className='rounded-full'
          onClick={remove}
        >
          <Trash size={16} />
        </Button>
      </TableCell>
    </TableRow>
  )
}