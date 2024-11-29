import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";
import Content from "./_components/content";

export default async function Page() {
  const ruangs = await api.mRuang.getSelectByUser();
  const kodeAnggarans = await api.kodeAnggaran.getSelectByUser();

  return (
    <div>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Buat permintaan barang
          </h1>
          <p className="text-muted-foreground">List permintaan barang kamu.</p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <Content kodeAnggarans={kodeAnggarans} ruangs={ruangs} />
      </div>
    </div>
  );
}
