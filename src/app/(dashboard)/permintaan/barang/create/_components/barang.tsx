import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { type CartType } from "@/data/cart";
import { type PrimitiveAtom, useAtom } from "jotai";
import { Trash } from "lucide-react";
import KodeAnggaranDialog from "./kode-anggaran-dialog";
import { type SelectProps } from "@/lib/type";
import { getInitials } from "@/lib/utils";
import { DeskripsiDialog } from "./deskripsi-dialog";

export default function Barang({
  cartAtom,
  remove,
  kodeAnggarans,
}: {
  cartAtom: PrimitiveAtom<CartType>;
  remove: () => void;
  kodeAnggarans: SelectProps[];
}) {
  const [cart, setCart] = useAtom(cartAtom);
  const isAset = cart.kode.split(".")[0] === "1";
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="mb-4 flex items-center gap-4">
          <div>
            <Avatar className="h-12 w-12 rounded-sm">
              <AvatarImage src={cart.image} alt="@shadcn" />
              <AvatarFallback>{getInitials(cart.name)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grow">
            <p className="text-sm font-semibold">{cart.name}</p>
            <p className="text-sm">{cart.kode}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {isAset && <DeskripsiDialog barang={cart} setCart={setCart} />}
      </TableCell>
      <TableCell>{cart.uom}</TableCell>
      <TableCell>
        <Input
          className="w-24"
          value={cart.qty}
          onChange={(e) => {
            setCart((prev) => ({
              ...prev,
              qty: e.target.value,
            }));
          }}
          placeholder="0"
          type="number"
        />
      </TableCell>
      <TableCell className="">
        <KodeAnggaranDialog
          cart={cart}
          setCart={setCart}
          kodeAnggarans={kodeAnggarans}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={remove}
        >
          <Trash size={16} />
        </Button>
      </TableCell>
    </TableRow>
  );
}

