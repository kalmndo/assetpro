import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";

export const barangKeluarRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.$transaction(async (tx) => {
          const barangGroupResult = await tx.permintaanBarangBarangGroup.findMany({
            where: {
              barangId: { in: input }
            }
          })
          const { tersedia } = await checkKetersediaanByBarang(tx, barangGroupResult)
          // console.log('tersedia', JSON.stringify(tersedia, null, 2))
          // update permintaanBarangBarangGroup
          // update im

          const ftkb = await tx.ftkb.create({
            data: {
              no: Math.random().toString(),
            }
          })

          for (const value of tersedia) {
            const ftkbItem = await tx.ftkbItem.create({
              data: {
                barangId: value.id,
                ftkbId: ftkb.id
              }
            })

            const toRemove: string[] = []

            for (const p of value.permintaanBarang) {
              if (p.permintaan === p.toTransfer) {
                toRemove.push(p.id)
              }
              const ftkbItemPemohon = await tx.ftkbItemPemohon.create({
                data: {
                  ftkbItemId: ftkbItem.id,
                  imId: p.href,
                  qty: p.toTransfer
                }
              })

              if (value.golongan === 'Aset') {
                await tx.ftkbItemPemohonAset.createMany({
                  data: p.noInventaris.map((v: any) => ({ ftkbItemPemohonId: ftkbItemPemohon.id, daftarAsetId: v }))
                })
              }
            }

            await tx.permintaanBarangBarangGroup.update({
              where: {
                barangId: value.id
              },
              data: {
                qty: { decrement: value.tersedia },
                ordered: { decrement: value.tersedia },
                permintaanBarang: { set: value.permintaanBarangId.filter((item: string) => !toRemove.includes(item)) }
              }
            })

            if (value.golongan === "Aset") {
              await tx.daftarAsetGroup.update({
                where: {
                  id: value.id
                },
                data: {
                  booked: { increment: value.tersedia },
                }
              })
            } else {
              await tx.kartuStok.update({
                where: {
                  id: value.id
                },
                data: {
                  qty: { decrement: value.tersedia }
                }
              })
            }

          }

        })
      } catch (error) {
        console.log("error", error)
      }
    })
});
