import { CurrencyInput } from "@/components/currency-input";
import { Label } from "@/components/ui/label";
import { useAtom, type PrimitiveAtom } from "jotai";

export default function Items({
  barangAtom,
  status
}: {
  barangAtom: PrimitiveAtom<{
    id: string;
    name: string;
    image: string | null;
    kode: string;
    qty: number;
    uom: string;
    harga: number | null;
    hargaString: string
    hargaPrev: number | null | undefined
    hargaNego: number | undefined
    totalHarga: number | null;
    garansi: string;
    termin: string;
    catatan: string;
  }>,
  status: boolean
}) {
  const [barang, setBarang] = useAtom(barangAtom)

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-lg border mb-5">
      <div className="flex-shrink-0 rounded-lg overflow-hidden w-full md:w-[200px] aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={!barang.image ? "https://generated.vusercontent.net/placeholder.svg" : barang.image}
          alt={barang.name}
          width={200}
          height={200}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 grid gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold">{barang.name}</h3>
          <div className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">{barang.kode}</div>
        </div>
        <p className="font-semibold">{barang.qty} {barang.uom}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies ultricies, nunc
          nisl ultricies nunc, nec ultricies nunc nisl nec nunc. Nullam auctor, nisl nec ultricies ultricies, nunc nisl
          ultricies nunc, nec ultricies nunc nisl nec nunc.
        </p>
        <div className="flex flex-col gap-2">
          <div>
            <Label htmlFor="catatan">Catatan</Label>
            <p className="text-sm">{barang.catatan}</p>
          </div>
          <div>
            <Label htmlFor="termin">Termin pembayaran & waktu pengiriman</Label>
            <p className="text-sm">{barang.termin}</p>
          </div>
          <div>
            <Label htmlFor="garansi">Garansi</Label>
            <p className="text-sm">{barang.garansi}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <Label htmlFor="prevHarga">Harga penawaran sebelumnya</Label>
              <p className="text-sm font-semibold"> Rp {barang.hargaPrev?.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <Label htmlFor="prevHarga">Harga penawaran</Label>
              <p className="font-bold text-green-800 "> Rp {barang.hargaNego?.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {status ?
            <div className='flex space-x-4'>
              <span className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}>
                Rp {barang.harga?.toLocaleString('id-ID')}
              </span>
            </div>
            :
            <div>
              <Label htmlFor="quantity">Harga Nett Satuan</Label>
              <CurrencyInput
                name="harga"
                placeholder="Rp ..."
                onValueChange={(_value, _name, values) => {
                  setBarang((v) => ({
                    ...v,
                    hargaString: values!.value,
                    harga: values!.float,
                    totalHarga: values!.float! * barang.qty
                  }))
                }
                }
              />
            </div>
          }

          <div className="text-lg font-semibold">Rp {barang.totalHarga?.toLocaleString("id-Id")}</div>
        </div>
      </div>
    </div>
  )
}