import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { api } from "@/trpc/server";
import Content from "./_components/content";

export default async function Page() {
  const { tersedia, takTersedia } = await api.permintaanBarang.checkKetersediaanByBarang()

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            Gudang
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Permintaan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Content tersedia={tersedia} takTersedia={takTersedia} />
    </div>
  )
}