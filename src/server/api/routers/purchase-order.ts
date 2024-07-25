import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const purchaseOrderRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.pO.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          PoBarang: true
        }
      })

      return result?.map((v) => ({
        ...v,
        jumlah: v.PoBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.pO.findUnique({
        where: { id },
        include: {
          PoBarang: {
            include: {
              Barang: {
                include: {
                  Vendor: true,
                  PembelianBarang: {
                    include: {
                      PermintaanPenawaranBarangVendor: {
                        include: {
                          Vendor: true
                        }
                      },
                      MasterBarang: {
                        include: {
                          Uom: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          Evaluasi: true,
          Vendor: true
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      const vendor = result.Vendor

      return {
        ...result,
        tanggal: result.createdAt.toLocaleDateString("id-ID"),
        noEvaluasi: result.Evaluasi.no,
        vendor,
        barang: result.PoBarang.map((v) => {
          const lah = v.Barang.PembelianBarang.PermintaanPenawaranBarangVendor.find((p) => p.Vendor.vendorId === v.Barang.Vendor.vendorId)
          return ({
            ...v.Barang.PembelianBarang.MasterBarang,
            kode: v.Barang.PembelianBarang.MasterBarang.fullCode,
            qty: v.Barang.PembelianBarang.qty,
            uom: v.Barang.PembelianBarang.MasterBarang.Uom.name,
            harga: v.Barang.harga?.toLocaleString("id-ID"),
            totalHarga: v.Barang.totalHarga?.toLocaleString("id-ID"),
            catatan: lah?.catatan,
            garansi: lah?.garansi,
            termin: lah?.termin
            //  asdf: v.Barang.PembelianBarang.PermintaanPenawaranBarangVendor.find((v) => v.) 
          })
        })
      }
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.organisasi.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
      } = input

      try {
        await ctx.db.organisasi.create({
          data: {
            name,
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah organisasi'
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
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
      } = input

      try {

        await ctx.db.department.update({
          where: {
            id
          },
          data: {
            name
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah organisasi'
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
          message: 'Berhasil menghapus organisasi'
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
