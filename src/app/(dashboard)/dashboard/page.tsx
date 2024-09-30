// 1. user
// 2. permintaan barang
//    persetujuan permintaan barang
//    barang tersedia
//    barang tidak tersedia
// 3. pengadaan
// 4. perbaikan
// 5. peminjaman

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "./_components/overview";
import PermintaanBarang from "./_components/permintaan-barang";
import { api } from "@/trpc/server";

// kalau role user tidak ada tabs
// kalau ada role tabs nya tergantung role

export default async function Page() {
  const data = await api.user.getDashboard()
  return (
    <div>
      <div className="flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">Welcome, Adam</h1>
          <p className="text-muted-foreground">Here is what happened</p>
        </div>
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        {!data.isUser ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Permintaan</TabsTrigger>
              <TabsTrigger value="permintaan">Permintaan Barang</TabsTrigger>
              <TabsTrigger value="pengadaan" disabled>
                Pengadaan
              </TabsTrigger>
              <TabsTrigger value="perbaikan" disabled>
                Perbaikan
              </TabsTrigger>
              <TabsTrigger value="peminjaman" disabled>
                Peminjaman
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Overview data={data.overview} />
            </TabsContent>
            <TabsContent value="permintaan" className="space-y-4">
              <PermintaanBarang data={data.overview} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <Overview data={data.overview} />
          </div>
        )}
        {/* <Table data={data} /> */}
      </div>
    </div>
  );
}

