import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouterOutputs } from "@/trpc/react";
import { DollarSign, TrendingDown, TrendingUp, Warehouse } from "lucide-react";

export default function TheCard({ data }: { data: RouterOutputs['kartuStok']['get']['card'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card x-chunk="dashboard-01-chunk-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium">
            Stok saat ini
          </CardTitle>
          <Warehouse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.stok}</div>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium">Total harga</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.harga}</div>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium">
            Total masuk
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground " color="green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">{data.masuk}</div>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium">Total keluar</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" color="red" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{data.keluar}</div>
        </CardContent>
      </Card>
    </div>
  )
}