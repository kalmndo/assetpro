import { api } from "@/trpc/server";
import Content from "@/feature/shared/perbaikan/page";;

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await api.perbaikan.get({ id });

  return (
    <Content data={data} imComponents={[]} />
  );
}

