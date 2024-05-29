import { STATUS } from "@/lib/status";
import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const vendorRouter = createTRPCRouter({
  getPermintaanPenawaran: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.permintaanPenawaranVendor.findUnique({
        where: {
          id
        },
        include: {
          Penawaran: true,
          PermintaanPenawaranBarangVendor: {
            include: {
              PembelianBarang: {
                include: {
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
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      const barang = result.PermintaanPenawaranBarangVendor.map((v) => ({
        id: v.id,
        name: v.PembelianBarang.MasterBarang.name,
        image: v.PembelianBarang.MasterBarang.image,
        kode: v.PembelianBarang.MasterBarang.fullCode,
        qty: v.PembelianBarang.qty,
        uom: v.PembelianBarang.MasterBarang.Uom.name,
        harga: v.harga ?? 0,
        hargaString: String(v.harga ?? 0),
        totalHarga: v.totalHarga
      }))

      return {
        ...result,
        barang,
        no: result.Penawaran.no,
        tanggal: result.Penawaran.createdAt.toLocaleDateString()
      }
    }),
  sendPermintaanPenawaran: publicProcedure
    .input(
      z.object({
        id: z.string(),
        barang: z.array(z.object({
          id: z.string(),
          harga: z.number(),
          qty: z.number()
        }))
      }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        barang
      } = input
      try {

        await ctx.db.$transaction(async (tx) => {
          await tx.permintaanPenawaranVendor.update({
            where: {
              id,
            },
            data: {
              status: true,
            }
          })

          for (const iterator of barang) {
            await tx.permintaanPenawaranBarangVendor.update({
              where: {
                id: iterator.id
              },
              data: {
                harga: iterator.harga,
                totalHarga: iterator.harga * iterator.qty
              }
            })
          }
        })

        return {
          ok: true,
          message: "berhasil kirim harga penawaran"
        }
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }
    }),
  getPenawaranHarga: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const result = await ctx.db.penawaranHargaVendor.findUnique({
        where: {
          id
        },
        include: {
          PenawaraanHarga: true,
          PenawaranHargaBarangVendor: {
            include: {
              PembelianBarang: {
                include: {
                  PenawaranHargaBarangNego: true,
                  PermintaanPenawaranBarangVendor: {
                    include: {
                      Vendor: {
                        include: {
                          Vendor: true
                        }
                      }
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
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      const barang = result.PenawaranHargaBarangVendor.map((v) => ({
        id: v.id,
        name: v.PembelianBarang.MasterBarang.name,
        image: v.PembelianBarang.MasterBarang.image,
        kode: v.PembelianBarang.MasterBarang.fullCode,
        qty: v.PembelianBarang.qty,
        uom: v.PembelianBarang.MasterBarang.Uom.name,
        harga: v.harga ?? 0,
        hargaString: String(v.harga ?? 0),
        hargaPrev: v.PembelianBarang.PermintaanPenawaranBarangVendor.filter((a) => a.Vendor.Vendor.id === result.vendorId)[0]?.harga,
        hargaNego: v.PembelianBarang.PenawaranHargaBarangNego?.hargaNego,
        totalHarga: v.totalHarga
      }))

      return {
        ...result,
        barang,
        no: result.PenawaraanHarga.no,
        tanggal: result.PenawaraanHarga.createdAt.toLocaleDateString()
      }
    }),
  sendPenawaranHarga: publicProcedure
    .input(
      z.object({
        id: z.string(),
        barang: z.array(z.object({
          id: z.string(),
          harga: z.number(),
          qty: z.number()
        }))
      }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        barang
      } = input
      try {

        await ctx.db.$transaction(async (tx) => {
          await tx.penawaranHargaVendor.update({
            where: {
              id,
            },
            data: {
              status: true,
            }
          })

          for (const iterator of barang) {
            await tx.penawaranHargaBarangVendor.update({
              where: {
                id: iterator.id
              },
              data: {
                harga: iterator.harga,
                totalHarga: iterator.harga * iterator.qty
              }
            })
          }
        })

        return {
          ok: true,
          message: "berhasil kirim harga penawaran"
        }
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }
    }),
});
