
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { STATUS } from "@/lib/status";

export const permintaanPembelianRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      const barangGroupResult = await ctx.db.permintaanBarangBarangGroup.findMany({
        where: {
          barangId: { in: input }
        }
      })
      const { takTersedia } = await checkKetersediaanByBarang(ctx, barangGroupResult)
      const barangs = takTersedia.flatMap((v) => v.permintaanBarang)
      const im = imToUpdateStatus(barangs)

      // TODO: NOTIFIKASI KE USER
      await ctx.db.$transaction(async (tx) => {
        const permPem = await tx.permintaanPembelian.create({
          data: {
            no: '12',
            status: "pengajuan"
          }
        })
        for (const iterator of im) {
          await tx.permintaanBarang.update({
            where: {
              id: iterator
            },
            data: {
              status: STATUS.PROCESS.id
            }
          })
        }
        await tx.pBPP.createMany({
          data: im.map((v) => ({ permintaanId: v, pembelianId: permPem.id }))
        })

        for (const value of takTersedia) {
          const ppb = await tx.permintaanPembelianBarang.create({
            data: {
              barangId: value.id,
              formId: permPem.id,
              qty: value.permintaan
            }
          })
          const groupPermintaanBarangLeft: string[] = []

          for (const iterator of value.permintaanBarang) {
            if (iterator.permintaan !== iterator.beli) {
              groupPermintaanBarangLeft.push(iterator.id)

            }
            await tx.permintaanBarangBarang.update({
              where: {
                id: iterator.id
              },
              data: {
                qtyOrdered: iterator.beli,
                status: iterator.status === 'approve' ? { set: STATUS.PROCESS.id } : {}
              }
            })
            const splitResult = await tx.permintaanBarangBarangSplit.create({
              data: {
                pbbId: iterator.id,
                desc: "Permintaan pembelian",
                qty: iterator.beli,
                status: 'order',
                PermintaanBarangBarangSplitHistory: {
                  create: {
                    formId: permPem.id,
                    formType: 'permintaan-pembelian',
                  }
                }
              },
              include: {
                PermintaanBarangBarangSplitHistory: true
              }
            })
            await tx.pBSPBB.create({
              data: {
                barangSplitId: splitResult.id,
                pembelianBarangId: ppb.id
              }
            })
          }

          await tx.permintaanBarangBarangGroup.update({
            where: {
              barangId: value.id,
            },
            data: {
              qty: { decrement: value.permintaan },
              permintaanBarang: { set: groupPermintaanBarangLeft }
            }
          })
        }
      })

      // console.log("takTersedia", takTersedia.flatMap((v) => v.permintaanBarang))
      console.log("tak", takTersedia)

    }),
});

function imToUpdateStatus(data: any): string[] {
  return [...new Set(data.filter((item: any) => item.imStatus === 'approve').map((item: any) => item.href))] as string[]
}


// TODO: Nanti untuk keluar barang gini aja dam
// di form draft keluar barang, bagi atas bawah table nya aset dan persediaan
// aset pilih dulu no inventaris nya tapi permintaan pertama yang di dahului
// saat terima barang ada no inventaris nah disitu udah di book untuk user siapa, coba tampilkan untuk barang keluar