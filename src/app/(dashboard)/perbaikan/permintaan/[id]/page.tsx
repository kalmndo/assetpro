import { api } from "@/trpc/server";
import Content from "@/feature/shared/perbaikan/page";
import { SelectProps } from "@/lib/type";
import { RouterOutputs } from "@/trpc/react";

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.perbaikan.get({ id })
  let teknisi: SelectProps[] = []
  let vendors: SelectProps[] = []
  let imComponents: RouterOutputs['perbaikan']['getImConponents'] = []

  if (data.isCanSelectTeknisi) {
    const res = await api.teknisi.getSelect()
    teknisi = res
  }

  if (data.isTeknisiCanDone) {
    const ven = await api.vendor.getSelect()
    const res = await api.perbaikan.getImConponents({ id })
    imComponents = res
    vendors = ven
  }

  return (
    <Content data={data} teknisi={[]} vendors={vendors} imComponents={imComponents} />
  )
}