import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const kartuStokRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.kartuStok.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          MasterBarang: {
            include: {
              Uom: true,
              SubSubKategori: true
            }
          }
        }
      })

      return result.map((v) => ({
        id: v.id,
        barang: {
          name: v.MasterBarang.name,
          image: v.MasterBarang.image,
        },
        code: v.MasterBarang.fullCode,
        kategori: v.MasterBarang.SubSubKategori.name,
        satuan: v.MasterBarang.Uom.name,
        jumlah: v.qty,
        harga: ''
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.kartuStok.findFirst({
        where: {
          id
        },
        include: {
          MasterBarang: {
            include: {
              Uom: true,
              FtkbItem: {
                include: {
                  FtkbItemPemohon: {
                    include: {

                    }
                  }
                }
              }
            },
          },
          FttbItemKartuStock: {
            include: {
              FttbItem: true
            }
          },
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: 'Tidak ada form ini'
        });
      }

      const barang = result.MasterBarang
      const keluar = result.MasterBarang.FtkbItem
      const masuk = result.FttbItemKartuStock

      const res = {
        barang: {
          name: barang.name,
          image: barang.image,
          code: barang.fullCode,
          jumlah: result.qty,
          uom: barang.Uom.name,
          deskripsi: barang.deskripsi
        },
        // pergerakanStok:
        riwayat: {
          masuk,
          keluar
        }
      }
      console.log("res", JSON.stringify(res, null, 2))

      return {
        // barang : {
        //    name:
        //    image:
        //    code:
        //    jumlah:
        //    uom:
        //    deskripsi
        // }
        // pergerakanStok: [
        // ]
        // riwayat: {
        //  masuk
        //  keluar
        // }
      }
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.department.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
        organisasiId: v.organisasiId
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      organisasiId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        organisasiId
      } = input

      try {
        await ctx.db.department.create({
          data: {
            organisasiId,
            name,
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah department'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      organisasiId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        organisasiId
      } = input

      try {

        await ctx.db.department.update({
          where: {
            id
          },
          data: {
            name,
            organisasiId
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah department'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input

      try {
        await ctx.db.department.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus department'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

});
