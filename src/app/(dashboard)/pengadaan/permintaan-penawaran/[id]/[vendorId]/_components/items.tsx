import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAtom, type PrimitiveAtom } from "jotai";

export default function Items({
  barangAtom,
  status,
}: {
  barangAtom: PrimitiveAtom<{
    id: string;
    name: string;
    image: string | null;
    kode: string;
    desc: string;
    qty: number;
    uom: string;
    harga: number | null;
    hargaString: string;
    totalHarga: number | null;
    delivery: string | null;
    garansi: string;
    termin: string;
    catatan: string;
  }>;
  status: boolean;
}) {
  const [barang, setBarang] = useAtom(barangAtom);

  return (
    <div className="mb-5 flex flex-col items-start gap-6 rounded-lg border p-6 md:flex-row">
      <div className="aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg md:w-[200px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            !barang.image
              ? "https://generated.vusercontent.net/placeholder.svg"
              : barang.image
          }
          alt={barang.name}
          width={200}
          height={200}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid flex-1 gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold">{barang.name}</h3>
          <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {barang.kode}
          </div>
        </div>
        <p className="font-semibold">
          {barang.qty} {barang.uom}
        </p>
        <p
          className="text-sm leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: barang.desc }}
        />
        <div className="flex flex-col gap-2">
          <div>
            <Label htmlFor="catatan">Catatan</Label>
            {status ? (
              <p className="text-sm">{barang.catatan}</p>
            ) : (
              <Input
                name="catatan"
                placeholder="Catatan"
                value={barang.catatan ?? ""}
                onChange={(v) => {
                  setBarang((prev) => ({
                    ...prev,
                    catatan: v.target.value,
                  }));
                }}
              />
            )}
          </div>
          <div>
            <Label htmlFor="termin">
              {!status && <span className="text-red-600">*</span>} Termin
              pembayaran
            </Label>
            {status ? (
              <p className="text-sm">{barang.termin}</p>
            ) : (
              <Input
                name="termin"
                placeholder="Termin pembayaran"
                value={barang.termin ?? ""}
                onChange={(v) => {
                  setBarang((prev) => ({
                    ...prev,
                    termin: v.target.value,
                  }));
                }}
              />
            )}
          </div>
          <div>
            <Label htmlFor="delivery">
              {!status && <span className="text-red-600">*</span>} Waktu
              pengiriman
            </Label>
            {status ? (
              <p className="text-sm">{barang.delivery}</p>
            ) : (
              <Input
                name="termin"
                placeholder="Waktu pengiriman"
                value={barang.delivery ?? ""}
                onChange={(v) => {
                  setBarang((prev) => ({
                    ...prev,
                    delivery: v.target.value,
                  }));
                }}
              />
            )}
          </div>
          <div>
            <Label htmlFor="garansi">
              {!status && <span className="text-red-600">*</span>} Garansi
            </Label>
            {status ? (
              <p className="text-sm">{barang.garansi}</p>
            ) : (
              <Input
                name="garansi"
                placeholder="Garansi"
                value={barang.garansi ?? ""}
                onChange={(v) => {
                  setBarang((prev) => ({
                    ...prev,
                    garansi: v.target.value,
                  }));
                }}
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          {status ? (
            <div className="flex space-x-4">
              <span
                className={`max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] `}
              >
                Rp {barang.harga?.toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <div>
              <Label htmlFor="quantity">
                {" "}
                {!status && <span className="text-red-600">*</span>} Harga
                satuan
              </Label>
              <CurrencyInput
                name="harga"
                placeholder="Rp ..."
                onValueChange={(_value, _name, values) => {
                  setBarang((v) => ({
                    ...v,
                    hargaString: values!.value,
                    harga: values!.float,
                    totalHarga: values!.float! * barang.qty,
                  }));
                }}
              />
            </div>
          )}

          <div className="text-lg font-semibold">
            Rp {barang.totalHarga?.toLocaleString("id-Id")}
          </div>
        </div>
        <Separator />
      </div>
    </div>
  );
}

