// import { STATUS } from "@/lib/status";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const vendorRouter = createTRPCRouter({
  getSelect: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.vendor.findMany();
    return res.map((v) => ({
      label: v.name,
      value: v.id,
    }));
  }),
  getPermintaanPenawaran: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const result = await ctx.db.permintaanPenawaranVendor.findUnique({
        where: {
          id,
        },
        include: {
          Vendor: true,
          Penawaran: true,
          PermintaanPenawaranBarangVendor: {
            include: {
              PembelianBarang: {
                include: {
                  PBSPBB: {
                    include: {
                      BarangSplit: { include: { Barang: true } },
                    },
                  },
                  MasterBarang: {
                    include: {
                      Uom: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      const barang = result.PermintaanPenawaranBarangVendor.map((v) => {
        let desc = v.PembelianBarang.MasterBarang.deskripsi;
        if (v.PembelianBarang.MasterBarang.fullCode.split(".")[0] === "1") {
          desc = v.PembelianBarang.PBSPBB[0]!.BarangSplit.Barang.desc;
        }
        return {
          id: v.id,
          name: v.PembelianBarang.MasterBarang.name,
          image: v.PembelianBarang.MasterBarang.image,
          kode: v.PembelianBarang.MasterBarang.fullCode,
          qty: v.PembelianBarang.qty,
          uom: v.PembelianBarang.MasterBarang.Uom.name,
          desc,
          harga: v.harga ?? 0,
          hargaString: String(v.harga ?? 0),
          totalHarga: v.totalHarga,
          catatan: v.catatan,
          garansi: v.garansi,
          termin: v.termin,
          delivery: v.delivery,
        };
      });

      return {
        ...result,
        barang,
        vendor: {
          ...result.Vendor,
        },
        no: result.Penawaran.no,
        tanggal: result.Penawaran.createdAt.toLocaleDateString(),
      };
    }),
  sendPermintaanPenawaran: publicProcedure
    .input(
      z.object({
        id: z.string(),
        barang: z.array(
          z.object({
            id: z.string(),
            harga: z.number(),
            qty: z.number(),
            garansi: z.string().nullable(),
            delivery: z.string().nullable(),
            termin: z.string().nullable(),
            catatan: z.string().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, barang } = input;
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.permintaanPenawaranVendor.update({
            where: {
              id,
            },
            data: {
              status: true,
            },
          });

          for (const iterator of barang) {
            await tx.permintaanPenawaranBarangVendor.update({
              where: {
                id: iterator.id,
              },
              data: {
                harga: iterator.harga,
                totalHarga: iterator.harga * iterator.qty,
                catatan: iterator.catatan,
                garansi: iterator.garansi,
                termin: iterator.termin,
                delivery: iterator.delivery,
              },
            });
          }
        });

        return {
          ok: true,
          message: "berhasil kirim harga penawaran",
        };
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
      const { id } = input;
      const result = await ctx.db.penawaranHargaVendor.findUnique({
        where: {
          id,
        },
        include: {
          Vendor: true,
          PenawaraanHarga: true,
          PenawaranHargaBarangVendor: {
            include: {
              PembelianBarang: {
                include: {
                  PBSPBB: {
                    include: { BarangSplit: { include: { Barang: true } } },
                  },
                  PenawaranHargaBarangNego: true,
                  PermintaanPenawaranBarangVendor: {
                    include: {
                      Vendor: {
                        include: {
                          Vendor: true,
                        },
                      },
                    },
                  },
                  MasterBarang: {
                    include: {
                      Uom: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      const barang = result.PenawaranHargaBarangVendor.map((v) => {
        const harga =
          v.harga ??
          v.PembelianBarang.PermintaanPenawaranBarangVendor.filter(
            (a) => a.Vendor.Vendor.id === result.vendorId,
          )[0]?.harga;

        let desc = v.PembelianBarang.MasterBarang.deskripsi;
        if (v.PembelianBarang.MasterBarang.fullCode.split(".")[0] === "1") {
          desc = v.PembelianBarang.PBSPBB[0]!.BarangSplit.Barang.desc;
        }

        return {
          id: v.id,
          name: v.PembelianBarang.MasterBarang.name,
          image: v.PembelianBarang.MasterBarang.image,
          kode: v.PembelianBarang.MasterBarang.fullCode,
          desc,
          qty: v.PembelianBarang.qty,
          uom: v.PembelianBarang.MasterBarang.Uom.name,
          harga,
          hargaString: String(harga),
          catatan: v.PembelianBarang.PermintaanPenawaranBarangVendor.find(
            (v) => v.Vendor.Vendor.id === result.vendorId,
          )?.catatan,
          termin: v.PembelianBarang.PermintaanPenawaranBarangVendor.find(
            (v) => v.Vendor.Vendor.id === result.vendorId,
          )?.termin,
          garansi: v.PembelianBarang.PermintaanPenawaranBarangVendor.find(
            (v) => v.Vendor.Vendor.id === result.vendorId,
          )?.garansi,
          delivery: v.PembelianBarang.PermintaanPenawaranBarangVendor.find(
            (v) => v.Vendor.Vendor.id === result.vendorId,
          )?.delivery,
          hargaNego: v.PembelianBarang.PenawaranHargaBarangNego?.hargaNego,
          catatanNego: v.PembelianBarang.PenawaranHargaBarangNego?.catatan,
          terminNego: v.PembelianBarang.PenawaranHargaBarangNego?.termin,
          deliveryNego: v.PembelianBarang.PenawaranHargaBarangNego?.delivery,
          garansiNego: v.PembelianBarang.PenawaranHargaBarangNego?.garansi,
          totalHarga: v.totalHarga ?? harga! * v.PembelianBarang.qty,
        };
      });

      return {
        ...result,
        barang,
        vendor: {
          ...result.Vendor,
        },
        no: result.PenawaraanHarga.no,
        tanggal: result.PenawaraanHarga.createdAt.toLocaleDateString(),
      };
    }),
  sendPenawaranHarga: publicProcedure
    .input(
      z.object({
        id: z.string(),
        barang: z.array(
          z.object({
            id: z.string(),
            harga: z.number(),
            catatan: z.string().nullable(),
            termin: z.string().nullable(),
            delivery: z.string().nullable(),
            garansi: z.string().nullable(),
            qty: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, barang } = input;
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.penawaranHargaVendor.update({
            where: {
              id,
            },
            data: {
              status: true,
            },
          });

          for (const iterator of barang) {
            await tx.penawaranHargaBarangVendor.update({
              where: {
                id: iterator.id,
              },
              data: {
                harga: iterator.harga,
                totalHarga: iterator.harga * iterator.qty,
                catatan: iterator.catatan,
                termin: iterator.termin,
                delivery: iterator.delivery,
                garansi: iterator.garansi,
              },
            });
          }
        });

        return {
          ok: true,
          message: "berhasil kirim harga penawaran",
        };
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }
    }),
});
