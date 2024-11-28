import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import monthsSince from "@/lib/month-since";

export const laporanRouter = createTRPCRouter({
  semuaAset: protectedProcedure
    .input(z.object({ tahun: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { tahun } = input;

      const startDate = new Date(`${String(tahun - 1)}-01-01T00:00:00Z`); // Start of 2023
      const endDate = new Date(`${String(tahun)}-12-31T23:59:59Z`);

      const result = await ctx.db.$transaction(async (tx) => {
        const daftarAsetResult = await tx.daftarAset.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            MasterBarang: true,
          },
        });

        const kategoriRes = await tx.masterBarangKategori.findMany({
          where: { classCode: "1" },
        });
        const res = kategoriRes.map((v) => ({
          name: v.name,
          fullCode: v.fullCode,
          thisYear: 0,
          lastYear: 0,
        }));
        console.log("res", res);

        for (const val of daftarAsetResult) {
          const year = val.createdAt.getFullYear();
          const kategoriKode = val.MasterBarang.classCode.substring(0, 3);
          for (const asdf of res) {
            if (asdf.fullCode === kategoriKode) {
              if (year === tahun) {
                asdf.thisYear = asdf.thisYear + val.nilaiBuku;
              } else {
                asdf.lastYear = asdf.lastYear + val.nilaiBuku;
              }
            }
          }
        }

        return res.map((v, i) => {
          const percentage = ((v.thisYear - v.lastYear) / v.lastYear) * 100;
          return {
            ...v,
            id: i + 1,
            no: i + 1,
            percentage: isNaN(percentage) ? 0 : percentage,
          };
        });
      });
      return result;
    }),
  semuaAsetPerlokasi: protectedProcedure
    .input(
      z.object({
        kategoriId: z.string(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { kategoriId, from, to } = input;
      // org | saldoawal | penambahan | jumlah | susut | saldoakhir
      const organisasiDb = await ctx.db.organisasi.findMany();
      const organisasiArr = organisasiDb.map((v) => ({
        id: v.id,
        name: v.name,
        saldoAwal: 0,
        penambahan: 0,
        jumlah: 0,
        susut: 0,
        saldoAkhir: 0,
      }));

      const organisasi = organisasiArr.reduce((acc, item) => {
        // eslint-disable-next-line
        // @ts-ignore
        acc[item.id] = item;
        return acc;
      }, {});

      const katDb = await ctx.db.masterBarangKategori.findFirst({
        where: { id: kategoriId },
      });
      if (!katDb) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const aset = await ctx.db.daftarAset.findMany({
        where: {
          MasterBarang: {
            SubSubKategori: { SubKategori: { Kategori: { id: kategoriId } } },
          },
        },
        include: {
          Ruang: true,
          MasterBarang: {
            include: {
              SubSubKategori: {
                include: {
                  SubKategori: {
                    include: {
                      Kategori: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // saldo akhir = saldoawal + penambahan - susut

      for (const iterator of aset) {
        const orgId = iterator.Ruang!.orgId;
        // eslint-disable-next-line
        // @ts-ignore
        const v = organisasi[orgId];

        const monthLeft = monthsSince(iterator.createdAt);
        if (iterator.createdAt < from) {
          if (iterator.hargaPembelian) {
            if (monthLeft <= iterator.umur) {
              const monthlyDepreciation =
                iterator.hargaPembelian / iterator.umur;
              if (monthlyDepreciation > 0) {
                const total = monthlyDepreciation * monthLeft;

                v.susut = v.susut + total;
              }
            }
          }
          v.saldoAwal = v.saldoAwal + iterator.nilaiBuku;
          v.jumlah = v.jumlah + 1;
        } else if (iterator.createdAt > from && iterator.createdAt <= to) {
          if (iterator.hargaPembelian) {
            if (monthLeft <= iterator.umur) {
              const monthlyDepreciation =
                iterator.hargaPembelian / iterator.umur;
              if (monthlyDepreciation > 0) {
                const total = monthlyDepreciation * monthLeft;

                v.susut = v.susut + total;
              }
            }
          }
          v.penambahan = v.penambahan + iterator.nilaiBuku;
          v.jumlah = v.jumlah + 1;
        }
      }
      for (const [key, value] of Object.entries(organisasi)) {
        // eslint-disable-next-line
        // @ts-ignore
        const total = value.saldoAwal + value.penambahan;
        // eslint-disable-next-line
        // @ts-ignore
        value.saldoAkhir = total - value.susut;
      }

      // eslint-disable-next-line
      // @ts-ignore
      const result = Object.values(organisasi) as [
        {
          name: string;
          saldoAwal: number;
          penambahan: number;
          susut: number;
          jumlah: number;
          saldoAkhir: number;
        },
      ];
      return result;
    }),
  semuaStock: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { from, to } = input;

      const kartuStok = await ctx.db.kartuStok.findMany();
      const fttb = await ctx.db.fttbItemKartuStock.findMany({
        where: {
          FttbItem: {
            PoBarang: {
              Barang: {
                PembelianBarang: {
                  MasterBarang: {
                    SubSubKategori: {
                      SubKategori: { Kategori: { Golongan: { id: "2" } } },
                    },
                  },
                },
              },
            },
          },
        },
        include: {
          FttbItem: {
            include: {
              PoBarang: {
                include: {
                  Barang: {
                    include: {
                      PembelianBarang: {
                        include: {
                          PermintaanPembelian: {
                            include: {
                              PBPP: {
                                include: {
                                  Permintaan: {
                                    include: {
                                      Ruang: true,
                                      PermintaanBarangBarang: true,
                                    },
                                  },
                                },
                              },
                            },
                          },
                          MasterBarang: {
                            include: {
                              SubSubKategori: {
                                include: {
                                  SubKategori: {
                                    include: {
                                      Kategori: {
                                        include: {
                                          Golongan: true,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      const ftkb = await ctx.db.ftkbItemPemohon.findMany({
        where: {
          FtkbItem: {
            Barang: {
              SubSubKategori: {
                SubKategori: { Kategori: { Golongan: { id: "2" } } },
              },
            },
          },
        },
        include: {
          IM: {
            include: {
              Ruang: true,
            },
          },
          FtkbItem: {
            include: {
              Barang: {
                include: {
                  SubSubKategori: {
                    include: {
                      SubKategori: {
                        include: {
                          Kategori: {
                            include: {
                              Golongan: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      const organisasiDb = await ctx.db.organisasi.findMany();
      const organisasiArr = organisasiDb.map((v) => ({
        id: v.id,
        name: v.name,
        stockAwal: 0,
        stockAkhir: 0,
        totalMasukBefore: 0,
        totalKeluarBefore: 0,
        totalMasukAfter: 0,
        totalKeluarAfter: 0,
      }));

      const organisasi = organisasiArr.reduce((acc, item) => {
        // eslint-disable-next-line
        // @ts-ignore
        acc[item.id] = item;
        return acc;
      }, {});

      const masuk = fttb.flatMap((v) =>
        v.FttbItem.PoBarang.Barang.PembelianBarang.PermintaanPembelian.PBPP.flatMap(
          (va) =>
            va.Permintaan.PermintaanBarangBarang.map((a) => ({
              barangId: a.barangId,
              qty: a.qty,
              orgId: va.Permintaan.Ruang.orgId,
              createdAt: v.createdAt,
            })),
        ),
      );

      const keluar = ftkb.map((v) => ({
        barangId: v.FtkbItem.Barang.id,
        orgId: v.IM.Ruang.orgId,
        createdAt: v.createdAt,
        qty: v.qty,
      }));

      for (const iterator of masuk) {
        const orgId = iterator.orgId;

        // eslint-disable-next-line
        // @ts-ignore
        const v = organisasi[orgId];

        if (iterator.createdAt < from) {
          v.totalMasukBefore = v.totalMasukBefore + iterator.qty;
        } else if (iterator.createdAt > from && iterator.createdAt <= to) {
          v.totalMasukAfter = v.totalMasukAfter + iterator.qty;
        }
      }

      for (const iterator of keluar) {
        const orgId = iterator.orgId;

        // eslint-disable-next-line
        // @ts-ignore
        const v = organisasi[orgId];

        if (iterator.createdAt < from) {
          v.totalKeluarBefore = v.totalKeluarBefore + iterator.qty;
        } else if (iterator.createdAt > from && iterator.createdAt <= to) {
          v.totalKeluarAfter = v.totalKeluarAfter + iterator.qty;
        }
      }

      for (const [key, value] of Object.entries(organisasi)) {
        // eslint-disable-next-line
        // @ts-ignore
        value.stockAwal = value.totalMasukBefore - value.totalKeluarBefore;
        // eslint-disable-next-line
        // @ts-ignore
        value.stockAkhir = value.totalMasukAfter - value.totalKeluarAfter;
      }

      const result = Object.values(organisasi) as [
        {
          id: string;
          name: string;
          stockAwal: number;
          stockAkhir: number;
          totalMasukBefore: number;
          totalKeluarBefore: number;
          totalMasukAfter: number;
          totalKeluarAfter: number;
        },
      ];
      return result;
    }),
});
