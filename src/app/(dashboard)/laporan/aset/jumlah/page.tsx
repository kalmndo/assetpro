import { api } from "@/trpc/server";
import Content from "./_components/content";

export default async function Page() {
  const result = await api.laporan.getJumlah()
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan jumlah aset
          </h1>
          <p className="text-muted-foreground">
            Kelola laporan jumlah aset
          </p>
        </div>
      </div>
      <Content datas={result} />
    </div>
  );
}
