import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { STATUS } from "@/lib/status";
import { TRPCError } from "@trpc/server";
import { type PrismaClient } from "@prisma/client";
import PENOMORAN from "@/lib/penomoran";
import getPenomoran from "@/lib/getPenomoran";

export const barangKeluarRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.ftkb.findMany({
      include: {
        FtkbItem: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return result.map((v) => ({
      ...v,
      jumlah: v.FtkbItem.length,
      createdAt: v.createdAt.toLocaleDateString(),
    }));
  }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const result = await ctx.db.ftkb.findUnique({
        where: {
          id,
        },
        include: {
          FtkbItem: {
            include: {
              Barang: {
                include: {
                  Uom: true,
                },
              },
              FtkbItemPemohon: {
                include: {
                  IM: {
                    include: {
                      Pemohon: true,
                    },
                  },
                  FtkbItemPemohonAset: {
                    include: {
                      DaftarAset: true,
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Something wrong",
        });
      }

      const barangs = result.FtkbItem.map((v) => {
        const qty = v.qty;
        const masterBarang = v.Barang;

        const type = Number(masterBarang.fullCode.split(".")[0]);

        const barang = {
          id: masterBarang.id,
          name: masterBarang.name,
          image: masterBarang.image,
          uom: masterBarang.Uom.name,
        };

        const pemohon = v.FtkbItemPemohon.map((v) => {
          const asetIds = v.FtkbItemPemohonAset.map((v) => v.daftarAsetId);

          return {
            id: v.id,
            imId: v.IM.id,
            noIm: v.IM.no,
            name: v.IM.Pemohon.name,
            image: v.IM.Pemohon.image,
            qty: v.qty,
            asetIds: type === 1 ? asetIds : [],
          };
        });

        return {
          ...barang,
          qty,
          type,
          pemohon,
          no: [""],
        };
      });

      return {
        ...result,
        tanggal: result.createdAt.toLocaleDateString(),
        aset: barangs.filter((v) => v.type === 1),
        persediaan: barangs.filter((v) => v.type === 2),
      };
    }),
  create: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.$transaction(async (tx) => {
          const barangGroupResult =
            await tx.permintaanBarangBarangGroup.findMany({
              where: {
                barangId: { in: input },
              },
            });
          const { tersedia } = await checkKetersediaanByBarang(
            tx as PrismaClient,
            barangGroupResult,
          );

          let penomoran = await tx.penomoran.findUnique({
            where: {
              id: PENOMORAN.KELUAR_BARANG,
              year: String(new Date().getFullYear()),
            },
          });

          if (!penomoran) {
            penomoran = await tx.penomoran.create({
              data: {
                id: PENOMORAN.KELUAR_BARANG,
                code: "FTKB",
                number: 0,
                year: String(new Date().getFullYear()),
              },
            });
          }

          const ftkb = await tx.ftkb.create({
            data: {
              no: getPenomoran(penomoran),
              status: STATUS.SELESAI.id,
            },
          });

          if (ftkb) {
            await tx.penomoran.update({
              where: {
                id: PENOMORAN.KELUAR_BARANG,
                year: String(new Date().getFullYear()),
              },
              data: {
                number: { increment: 1 },
              },
            });
          }

          const permintaanBarangIds = tersedia.flatMap(
            (v) => v.permintaanBarangId,
          );

          const barangSplit = await tx.permintaanBarangBarangSplit.findMany({
            where: {
              pbbId: { in: permintaanBarangIds },
            },
          });

          await tx.permintaanBarangBarangSplit.updateMany({
            where: {
              pbbId: { in: permintaanBarangIds },
            },
            data: {
              status: "out",
            },
          });

          const barangSplitIds = barangSplit.map((v) => v.id);

          await tx.permintaanBarangBarangSplitHistory.createMany({
            data: barangSplitIds.map((v) => ({
              barangSplitId: v,
              formType: "barang-keluar",
              formNo: ftkb.no,
              desc: "Barang telah keluar dari gudang",
            })),
          });

          for (const value of tersedia) {
            const ftkbItem = await tx.ftkbItem.create({
              data: {
                barangId: value.id,
                ftkbId: ftkb.id,
                qty: value.permintaan,
              },
            });

            const toRemove: string[] = [];

            for (const p of value.permintaanBarang) {
              //eslint-disable-next-line
              //@ts-ignore
              if (p.permintaan === p.toTransfer) {
                toRemove.push(p.id);
              }
              const ftkbItemPemohon = await tx.ftkbItemPemohon.create({
                data: {
                  ftkbItemId: ftkbItem.id,
                  imId: p.href,
                  qty: value.permintaan,
                },
              });

              if (value.golongan === "Aset") {
                await tx.ftkbItemPemohonAset.createMany({
                  //eslint-disable-next-line
                  //@ts-ignore
                  data: p.noInventaris.map((v: any) => ({
                    ftkbItemPemohonId: ftkbItemPemohon.id,
                    daftarAsetId: v,
                  })),
                });

                //eslint-disable-next-line
                //@ts-ignore
                for (const noInv of p.noInventaris) {
                  await tx.daftarAset.update({
                    where: {
                      id: noInv,
                    },
                    data: {
                      penggunaId: p.pemohonId,
                    },
                  });
                }
              }
            }

            await tx.permintaanBarangBarangGroup.update({
              where: {
                barangId: value.id,
              },
              data: {
                qty: { decrement: value.permintaan },
                ordered: { decrement: value.permintaan },
                permintaanBarang: {
                  set: value.permintaanBarangId.filter(
                    (item: string) => !toRemove.includes(item),
                  ),
                },
              },
            });

            if (value.golongan === "Aset") {
              await tx.daftarAsetGroup.update({
                where: {
                  id: value.id,
                },
                data: {
                  booked: { increment: value.tersedia },
                },
              });
            } else {
              const stock = await tx.laporanStock.findFirst({
                where: {
                  stockId: value.id,
                },
                orderBy: {
                  date: "desc",
                },
              });
              for (const hmm of value.permintaanBarang) {
                const st = await tx.kartuStok.findFirst({
                  where: {
                    id: value.id,
                  },
                });
                const asdf = await tx.permintaanBarang.findFirst({
                  where: {
                    id: hmm.href,
                  },
                  include: {
                    Ruang: true,
                  },
                });

                const orgId = asdf!.Ruang.orgId;

                const qty = hmm.permintaan;

                const outPrice = stock ? stock.stockPrice : st!.harga;
                const outTotal = outPrice.mul(qty).toNumber();

                const stockQty = stock?.stockQty
                  ? stock.stockQty - qty
                  : st!.qty - qty;

                const stockTotal = stock?.stockTotal
                  ? stock.stockTotal.minus(outTotal).toNumber()
                  : st!.total.minus(outTotal).toNumber();

                const stockPrice = stockTotal / stockQty;

                await tx.laporanStock.create({
                  data: {
                    orgId,
                    stockId: value.id,
                    outQty: qty,
                    outPrice,
                    outTotal,
                    stockQty,
                    stockPrice,
                    stockTotal,
                  },
                });

                await tx.kartuStok.update({
                  where: {
                    id: value.id,
                  },
                  data: {
                    qty: stockQty,
                    harga: stockPrice,
                    total: stockTotal,
                  },
                });
              }

              const ksp = await tx.kartuStokPergerakan.findFirst({
                where: {
                  year: new Date().getFullYear(),
                  month: new Date().getMonth() + 1,
                  kartuStokId: value.id,
                },
              });

              if (ksp) {
                await tx.kartuStokPergerakan.update({
                  where: {
                    id: ksp.id,
                  },
                  data: {
                    out: { increment: value.tersedia },
                  },
                });
              } else {
                await tx.kartuStokPergerakan.create({
                  data: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    kartuStokId: value.id,
                  },
                });
              }
            }
          }
        });
        return {
          ok: true,
          message: "Berhasil membuat form keluar barang",
        };
      } catch (error) {
        console.log("error", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
});
