import { api } from "@/trpc/server";
import { type SelectProps } from "@/lib/type";
import Content from "@/feature/shared/perbaikan/page";
import { type RouterOutputs } from "@/trpc/react";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.perbaikan.get({ id });
  let teknisi: SelectProps[] = [];
  let imComponents: RouterOutputs["perbaikan"]["getImConponents"] = [];

  if (data.isCanSelectTeknisi) {
    const res = await api.teknisi.getSelect();
    teknisi = res;
  }

  if (data.isTeknisiCanDone) {
    const res = await api.perbaikan.getImConponents({ id });
    imComponents = res;
  }

  return (
    <Content data={data} teknisi={teknisi} vendors={[]} imComponents={[]} />
  );
}

