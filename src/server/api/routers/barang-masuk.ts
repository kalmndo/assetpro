import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const barangMasukRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.fttb.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          FttbItem: true
        }
      })

      return result.map((v) => ({
        no: v.no,
        jumlah: v.FttbItem.length,
        createdAt: v.createdAt.toLocaleDateString()
      }))
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterBarangKategori.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
        code: v.code,
        golonganId: v.golonganId
      }))
    }),
  findByPo: protectedProcedure
    .query(async ({ ctx, }) => {
      const result = await ctx.db.pO.findMany({
        where: {
          status: 'waiting'
        },
        include: {
          PoBarang: {
            where: {
              status: 0
            },
            include: {
              Barang: {
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
          }
        }
      })

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
            }
          })
        }
      })

    }),
  create: protectedProcedure
    .input(
      z.object({
        poId: z.string(),
        items: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        poId,
        items
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          const poBarangs = await tx.poBarang.findMany({
            where: {
              id: {
                in: items.map((v) => v)
              }
            },
            include: {
              Barang: {
                include: {
                  PembelianBarang: {
                    include: {
                      MasterBarang: true
                    }
                  }
                }
              }
            }
          })

          const fttb = await ctx.db.fttb.create({
            data: {
              poId,
              no: Math.random().toString(),
            }
          })

          for (const value of poBarangs) {
            const type = Number(value.Barang.PembelianBarang.MasterBarang.fullCode.split('.')[0])
            const masterBarangId = value.Barang.PembelianBarang.MasterBarang.id
            const qty = value.Barang.PembelianBarang.qty

            // aset

            if (type === 1) {
              const fttbItem = await tx.fttbItem.create({
                data: {
                  fttbId: fttb.id,
                  poBarangId: value.id,
                }
              })

              for (let i = 0; i < qty; i++) {
                await tx.daftarAset.create({
                  data: {
                    id: Math.random().toString(),
                    barangId: masterBarangId,
                    fttbItemId: fttbItem.id
                  }
                })
              }

              await tx.poBarang.update({
                where: {
                  id: value.id
                },
                data: {
                  status: 1
                }
              })

              await tx.daftarAsetGroup.update({
                where: {
                  id: masterBarangId
                },
                data: {
                  idle: { increment: qty },
                  used: { decrement: qty }
                }
              })
            } else {
              // kartu stok
              // if kartu stock empty create else update

              const result = await tx.fttbItem.create({
                data: {
                  fttbId: fttb.id,
                  poBarangId: value.id,
                }
              })

              await tx.fttbItemKartuStock.create({
                data: {
                  fttbItemId: result.id,
                  kartuStokId: masterBarangId
                }
              })

              await tx.kartuStok.upsert({
                where: {
                  id: masterBarangId
                },
                create: {
                  id: masterBarangId,
                  qty,
                },
                update: {
                  qty: { increment: qty }
                }
              })

              await tx.poBarang.update({
                where: {
                  id: value.id
                },
                data: {
                  status: 1
                }
              })
            }
          }
        })
        return {
          ok: true,
          message: 'Berhasil membuat barang masuk'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
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
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      golonganId: z.string(),
      classCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        code,
        golonganId,
        classCode
      } = input

      try {

        await ctx.db.masterBarangKategori.update({
          where: {
            id
          },
          data: {
            name,
            code: Number(code),
            golonganId,
            classCode,
            fullCode: `${classCode}.${code}`
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah kategori'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
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

  remove: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input

      try {
        await ctx.db.masterBarangKategori.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus kategori'
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
