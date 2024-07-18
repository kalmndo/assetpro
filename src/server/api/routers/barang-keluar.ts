import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { STATUS } from "@/lib/status";
import { TRPCError } from "@trpc/server";

export const barangKeluarRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.ftkb.findMany({
        include: {
          FtkbItem: true
        }
      })

      return result.map((v) => ({
        ...v,
        jumlah: v.FtkbItem.length,
        createdAt: v.createdAt.toLocaleDateString(),
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const result = await ctx.db.ftkb.findUnique({
        where: {
          id
        },
        include: {
          FtkbItem: {
            include: {
              Barang: {
                include: {
                  Uom: true
                }
              },
              FtkbItemPemohon: {
                include: {
                  IM: {
                    include: {
                      Pemohon: true
                    }
                  },
                  FtkbItemPemohonAset: {
                    include: {
                      DaftarAset: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something wrong",
        });
      }

      const barangs = result.FtkbItem.map((v) => {
        const qty = v.qty
        const masterBarang = v.Barang

        const type = Number(masterBarang.fullCode.split('.')[0])

        const barang = {
          id: masterBarang.id,
          name: masterBarang.name,
          image: masterBarang.image,
          uom: masterBarang.Uom.name,
        }

        const pemohon = v.FtkbItemPemohon.map((v) => {
          const asetIds = v.FtkbItemPemohonAset.map((v) => v.daftarAsetId)

          return {
            id: v.id,
            imId: v.IM.id,
            noIm: v.IM.no,
            name: v.IM.Pemohon.name,
            image: v.IM.Pemohon.image,
            qty: v.qty,
            asetIds: type === 1 ? asetIds : []
          }
        })


        return {
          ...barang,
          qty,
          type,
          pemohon,
          no: ['']
        }
      })

      return {
        ...result,
        tanggal: result.createdAt.toLocaleDateString(),
        aset: barangs.filter((v) => v.type === 1),
        persediaan: barangs.filter((v) => v.type === 2)
      }
    }),
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

          const ftkb = await tx.ftkb.create({
            data: {
              no: Math.random().toString(),
              status: STATUS.SELESAI.id
            }
          })

          const permintaanBarangIds = tersedia.flatMap((v) => v.permintaanBarangId)

          const barangSplit = await ctx.db.permintaanBarangBarangSplit.findMany({
            where: {
              pbbId: { in: permintaanBarangIds }
            }
          })

          const barangSplitIds = barangSplit.map((v) => v.id)

          await ctx.db.permintaanBarangBarangSplitHistory.createMany({
            data: barangSplitIds.map((v) => ({
              barangSplitId: v,
              formType: 'barang-keluar',
              formNo: ftkb.no,
              desc: 'Barang telah keluar dari gudang'
            }))
          })

          for (const value of tersedia) {
            const ftkbItem = await tx.ftkbItem.create({
              data: {
                barangId: value.id,
                ftkbId: ftkb.id,
                qty: value.tersedia
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

                for (const noInv of p.noInventaris) {
                  await tx.daftarAset.update({
                    where: {
                      id: noInv
                    },
                    data: {
                      penggunaId: p.pemohonId
                    }
                  })
                }
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
        return {
          ok: true,
          message: 'Berhasil membuat form keluar barang'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    })
});
