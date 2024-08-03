import { api } from "@/trpc/server";
import { type SelectProps } from "@/lib/type";
import Content from "@/feature/shared/perbaikan/page";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.perbaikan.get({ id })
  let teknisi: SelectProps[] = []
  if (data.isCanSelectTeknisi) {
    const res = await api.teknisi.getSelect()
    teknisi = res
  }

  return (
    <Content data={data} teknisi={teknisi} />
  )
}