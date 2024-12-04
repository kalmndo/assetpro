import { api } from "@/trpc/server";
import Content from '@/feature/shared/peminjaman/page'

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const data = await api.peminjaman.get({ id })

  return (
    <Content data={data} />
  )
}