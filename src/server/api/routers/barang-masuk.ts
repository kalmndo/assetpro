import getPenomoran from "@/lib/getPenomoran";
import notifDesc from "@/lib/notifDesc";
import PENOMORAN from "@/lib/penomoran";
import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const barangMasukRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.fttb.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        FttbItem: true,
      },
    });

    return result.map((v) => ({
      id: v.id,
      no: v.no,
      jumlah: v.FttbItem.length,
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

      const result = await ctx.db.fttb.findUnique({
        where: {
          id,
        },
        include: {
          Po: true,
          FttbItem: {
            include: {
              DaftarAset: true,
              PoBarang: {
                include: {
                  Barang: {
                    include: {
                      PembelianBarang: {
                        include: {
                          MasterBarang: {
                            include: { Uom: true },
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

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something wrong",
        });
      }

      const barangs = result.FttbItem.map((v) => {
        const qty = v.PoBarang.Barang.PembelianBarang.qty;
        const masterBarang = v.PoBarang.Barang.PembelianBarang.MasterBarang;

        const barang = {
          id: masterBarang.id,
          name: masterBarang.name,
          image: masterBarang.image,
          uom: masterBarang.Uom.name,
        };

        const type = Number(masterBarang.fullCode.split(".")[0]);

        return {
          ...barang,
          qty,
          type,
          no: v.DaftarAset.map((v) => v.id),
        };
      });

      return {
        ...result,
        tanggal: result.createdAt.toLocaleDateString(),
        aset: barangs.filter((v) => v.type === 1),
        persediaan: barangs.filter((v) => v.type === 2),
      };
    }),
  findByPo: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.pO.findMany({
      where: {
        status: STATUS.MENUNGGU.id,
      },
      include: {
        PoBarang: {
          where: {
            status: 0,
          },
          include: {
            Barang: {
              include: {
                PembelianBarang: {
                  include: {
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
        },
      },
    });

    return result.map((v) => {
      return {
        ...v,
        barang: v.PoBarang.map((a) => {
          return {
            id: a.id,
            qty: a.Barang.PembelianBarang.qty,
            uom: a.Barang.PembelianBarang.MasterBarang.Uom.name,
            name: a.Barang.PembelianBarang.MasterBarang.name,
            image: a.Barang.PembelianBarang.MasterBarang.image,
            code: a.Barang.PembelianBarang.MasterBarang.fullCode,
          };
        }),
      };
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        poId: z.string(),
        items: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { poId, items } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          const poBarangs = await tx.poBarang.findMany({
            where: {
              id: {
                in: items.map((v) => v),
              },
            },
            include: {
              Barang: {
                include: {
                  PembelianBarang: {
                    include: {
                      MasterBarang: true,
                    },
                  },
                },
              },
            },
          });

          let penomoran = await tx.penomoran.findUnique({
            where: {
              id: PENOMORAN.MASUK_BARANG,
              year: String(new Date().getFullYear()),
            },
          });

          if (!penomoran) {
            penomoran = await tx.penomoran.create({
              data: {
                id: PENOMORAN.MASUK_BARANG,
                code: "FTTB",
                number: 0,
                year: String(new Date().getFullYear()),
              },
            });
          }

          const fttb = await tx.fttb.create({
            data: {
              poId,
              no: getPenomoran(penomoran),
            },
          });

          const allRoles = await tx.userRole.findMany({ where: { roleId: ROLE.GUDANG_MASUK_VIEW.id } })
          const userIds = allRoles.map((v) => v.userId)
          const user = await tx.user.findFirst({
            where: {
              id: ctx.session.user.id
            }
          })

          await tx.notification.createMany({
            data: userIds.map((v) => ({
              fromId: ctx.session.user.id,
              toId: v,
              link: `/gudang/masuk/${fttb.id}`,
              desc: notifDesc(user!.name, "Form tanda terima barang", fttb.no),
              isRead: false,
            }))
          })

          if (fttb) {
            await tx.penomoran.update({
              where: {
                id: PENOMORAN.MASUK_BARANG,
                year: String(new Date().getFullYear()),
              },
              data: {
                number: { increment: 1 },
              },
            });
          }

          const imIds: string[] = [];

          for (const value of poBarangs) {
            const code = value.Barang.PembelianBarang.MasterBarang.fullCode;
            const type = Number(
              value.Barang.PembelianBarang.MasterBarang.fullCode.split(".")[0],
            );
            const masterBarangId = value.Barang.PembelianBarang.MasterBarang.id;
            const qty = value.Barang.PembelianBarang.qty;

            const pBSPBB = await tx.pBSPBB.findMany({
              where: {
                pembelianBarangId: value.Barang.pembelianBarangId,
              },
              include: {
                BarangSplit: {
                  include: { Barang: { include: { Permintaan: true } } },
                },
              },
            });

            // for inserting imId field in daftarAset model
            const theImdId = [];

            for (const {
              barangSplitId,
              BarangSplit: {
                pbbId,
                Barang: {
                  qty: theQty,
                  Permintaan: { peruntukan, id },
                  desc,
                },
              },
            } of pBSPBB) {
              await tx.permintaanBarangBarangSplitHistory.create({
                data: {
                  formType: "barang-masuk",
                  barangSplitId,
                  formNo: fttb.no,
                  desc: "Barang telah diterima di gudang",
                },
              });

              if (peruntukan) {
                await tx.permintaanBarangBarang.update({
                  where: {
                    id: pbbId,
                  },
                  data: {
                    status: "selesai",
                  },
                });
              }
              if (!imIds.includes(id)) {
                imIds.push(id);
                theImdId.push({ id, qty: theQty, desc });
              }
            }
            // aset
            if (type === 1) {
              const fttbItem = await tx.fttbItem.create({
                data: {
                  fttbId: fttb.id,
                  poBarangId: value.id,
                },
              });

              const subKat = await tx.masterBarangSubSubKategori.findFirst({
                where: {
                  fullCode: code.split(".").slice(0, 4).join("."),
                },
              });

              for (const val of theImdId) {
                for (let i = 0; i < val.qty; i++) {
                  let penomoran = await tx.penomoran.findUnique({
                    where: {
                      id: PENOMORAN.ASET,
                      year: String(new Date().getFullYear()),
                    },
                  });

                  if (!penomoran) {
                    penomoran = await tx.penomoran.create({
                      data: {
                        id: PENOMORAN.ASET,
                        code: "INV/YAH",
                        number: 0,
                        year: String(new Date().getFullYear()),
                      },
                    });
                  }
                  const aset = await tx.daftarAset.create({
                    data: {
                      id: getPenomoran(penomoran),
                      barangId: masterBarangId,
                      imId: val.id,
                      fttbItemId: fttbItem.id,
                      status: STATUS.ASET_IDLE.id,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                      umur: subKat?.umur ?? 10,
                      desc: val.desc,
                    },
                  });

                  if (aset) {
                    await tx.penomoran.update({
                      where: {
                        id: PENOMORAN.ASET,
                        year: String(new Date().getFullYear()),
                      },
                      data: {
                        number: { increment: 1 },
                      },
                    });
                  }
                }
              }

              await tx.poBarang.update({
                where: {
                  id: value.id,
                },
                data: {
                  status: 1,
                },
              });

              await tx.daftarAsetGroup.update({
                where: {
                  id: masterBarangId,
                },
                data: {
                  idle: { increment: qty },
                },
              });
            } else {
              // kartu stok

              const result = await tx.fttbItem.create({
                data: {
                  fttbId: fttb.id,
                  poBarangId: value.id,
                },
              });

              await tx.fttbItemKartuStock.create({
                data: {
                  fttbItemId: result.id,
                  kartuStokId: masterBarangId,
                },
              });

              const stock = await tx.laporanStock.findFirst({
                where: {
                  stockId: masterBarangId,
                },
                orderBy: {
                  date: "desc",
                },
              });

              const inPrice = value.Barang.harga!;
              const inTotal = qty * value.Barang.harga!;

              const stockQty = stock?.stockQty ? stock.stockQty + qty : qty;
              const stockTotal = stock?.stockTotal
                ? stock.stockTotal.plus(inTotal).toNumber()
                : inTotal;
              const stockPrice = stockTotal / stockQty;

              const edan = await tx.permintaanPembelian.findFirst({
                where: {
                  id: value.Barang.PembelianBarang.formId,
                },
                include: {
                  PBPP: {
                    include: { Permintaan: { include: { Ruang: true } } },
                  },
                },
              });
              const orgId = edan!.PBPP[0]!.Permintaan.Ruang.orgId;

              await tx.laporanStock.create({
                data: {
                  orgId,
                  stockId: masterBarangId,
                  inQty: qty,
                  inPrice,
                  inTotal,
                  stockQty,
                  stockPrice,
                  stockTotal,
                },
              });

              await tx.kartuStok.upsert({
                where: {
                  id: masterBarangId,
                },
                create: {
                  id: masterBarangId,
                  qty: stockQty,
                  harga: stockPrice,
                  total: stockTotal,
                },
                update: {
                  qty: stockQty,
                  harga: stockPrice,
                  total: stockTotal,
                },
              });

              const ksp = await tx.kartuStokPergerakan.findFirst({
                where: {
                  year: new Date().getFullYear(),
                  month: new Date().getMonth() + 1,
                  kartuStokId: masterBarangId,
                },
              });

              if (ksp) {
                await tx.kartuStokPergerakan.update({
                  where: {
                    id: ksp.id,
                  },
                  data: {
                    out: { increment: qty },
                  },
                });
              } else {
                await tx.kartuStokPergerakan.create({
                  data: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    kartuStokId: masterBarangId,
                  },
                });
              }
              await tx.poBarang.update({
                where: {
                  id: value.id,
                },
                data: {
                  status: 1,
                },
              });
            }
          }

          const poResult = await tx.pO.findFirst({
            where: {
              id: poId,
            },
            include: {
              PoBarang: true,
            },
          });

          if (!poResult) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something wrong",
            });
          }

          const poBarangStatuses = poResult.PoBarang.map((v) => v.status);
          const isDone = poBarangStatuses.every((v) => v === 1);

          if (isDone) {
            await tx.pO.update({
              where: {
                id: poId,
              },
              data: {
                status: STATUS.SELESAI.id,
              },
            });
          }

          const im = await tx.permintaanBarang.findMany({
            where: {
              id: { in: imIds },
            },
            include: {
              PermintaanBarangBarang: true,
            },
          });

          const forStock = im.filter((v) => v.peruntukan === 1);

          for (const value of forStock) {
            const isAllDone = value.PermintaanBarangBarang.map(
              (v) => v.status,
            ).every((v) => v === "selesai");

            if (isAllDone) {
              await tx.permintaanBarang.update({
                where: {
                  id: value.id,
                },
                data: {
                  status: "selesai",
                },
              });
            }
          }
        },
          {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
          }
        );
        return {
          ok: true,
          message: "Berhasil membuat barang masuk",
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Kode kategori ini sudah ada, harap ubah.",
              cause: error,
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
});
