import { api } from "@/trpc/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Table } from "./_components/table";
import { AddDialog } from "./_components/add-dialog";

export default async function Page() {
  const result = await api.mPeminjamanRuang.getAll();

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/master">Master</Link>
            </BreadcrumbLink>{" "}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Peminjaman ruang</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className="text-2xl font-bold tracking-tight">
            Master Peminjaman Ruang
          </h1>
          <p className="text-muted-foreground">Manajemen Peminjaman Ruang</p>
        </div>
        <div className="">
          <AddDialog ruangs={result.ruangs} />
        </div>
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <Table data={result.result} />
      </div>
    </div>
  );
}
