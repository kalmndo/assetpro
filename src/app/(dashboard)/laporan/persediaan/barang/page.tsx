import { api } from "@/trpc/server";
import Content from "./_components/content";

export default async function Page() {
  const data = await api.organisasi.getSelect();
  return (
    <div>
      <div className="mb flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan semua stock barang
          </h1>
          <p className="text-muted-foreground">Kelola laporan stock barang</p>
        </div>
      </div>
      <Content orgs={data} />
    </div>
  );
}
