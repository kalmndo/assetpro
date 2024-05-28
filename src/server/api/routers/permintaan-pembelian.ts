
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { STATUS } from "@/lib/status";
import { TRPCError } from "@trpc/server";
import { ROLE } from "@/lib/role";

export const permintaanPembelianRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.permintaanPembelian.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          PermintaanPembelianBarang: true
        }
      })

      return result.map((v) => ({
        ...v,
        jumlah: v.PermintaanPembelianBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input
      const userId = ctx.session.user.id

      const user = await ctx.db.user.findUnique({
        where: {
          id: userId
        },
        include: {
          UserRole: true
        }
      })
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada user ini",
        });
      }

      const roleIds = user.UserRole.map((v) => v.roleId)

      const result = await ctx.db.permintaanPembelian.findUnique({
        where: {
          id
        },
        include: {
          PBPP: { include: { Permintaan: true } },
          PermintaanPembelianBarang: {
            include: {
              MasterBarang: {
                include: {
                  Uom: true
                }
              },
              PBSPBB: true
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini",
        });
      }

      const isApprove = result.status === STATUS.PENGAJUAN.id && roleIds.some((v) => v === ROLE.PEMBELIAN_APPROVE.id)

      const isSelect = result.status === STATUS.IM_APPROVE.id && roleIds.some((v) => v === ROLE.PEMBELIAN_SELECT_VENDOR.id)

      const ims = result.PBPP.map((v) => ({
        id: v.permintaanId,
        no: v.Permintaan.no,
      }))

      const barang = result.PermintaanPembelianBarang.map((v) => ({
        id: v.id,
        image: v.MasterBarang.image,
        name: v.MasterBarang.name,
        kode: v.MasterBarang.fullCode,
        jumlah: v.qty,
        uom: v.MasterBarang.Uom.name
      }))

      return {
        ...result,
        tanggal: result.createdAt.toLocaleDateString(),
        ims,
        barang,
        isApprove,
        isSelect
      }
    })
  ,
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
  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await ctx.db.permintaanPembelian.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_APPROVE.id
            }
          })

          await tx.permintaanPenawaran.create({
            data: {
              no: '1',
              status: STATUS.MENUNGGU.id,
              pembelianId: id
            }
          })

        })

        return {
          ok: true,
          message: 'Berhasil menyetujui permintaan pembelian',
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan server",
          cause: error
        });
      }
    }),
});

function imToUpdateStatus(data: any): string[] {
  return [...new Set(data.filter((item: any) => item.imStatus === 'approve').map((item: any) => item.href))] as string[]
}


// TODO: Nanti untuk keluar barang gini aja dam
// di form draft keluar barang, bagi atas bawah table nya aset dan persediaan
// aset pilih dulu no inventaris nya tapi permintaan pertama yang di dahului
// saat terima barang ada no inventaris nah disitu udah di book untuk user siapa, coba tampilkan untuk barang keluar