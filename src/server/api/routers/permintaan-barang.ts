import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { STATUS, getStatus } from "@/lib/status";
import { ROLE } from "@/lib/role";

export const permintaanBarangRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.permintaanBarang.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Ruang: true,
          PermintaanBarangBarang: true
        }
      })

      return result.map((v) => ({
        ...v,
        ruang: v.Ruang.name,
        jumlah: v.PermintaanBarangBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { id } = input
      const result = await ctx.db.permintaanBarang.findFirst({
        where: {
          id
        },
        include: {
          Ruang: true,
          Pemohon: {
            include: {
              Department: true
            }
          },
          PermintaanBarangBarang: {
            include: {
              Uom: true,
              Barang: true,
              PermintaanBarangBarangKodeAnggaran: true
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

      const {
        no,
        perihal,
        Ruang: { name: ruang },
        createdAt,
        status,
        Pemohon: {
          name,
          image,
          title,
          atasanId,
          Department: {
            name: department
          }
        },
        PermintaanBarangBarang
      } = result



      const barang = PermintaanBarangBarang.map((v) => ({
        id: v.id,
        name: v.Barang.name,
        kode: v.Barang.fullCode,
        jumlah: String(v.qty),
        uom: {
          id: v.Uom.id,
          name: v.Uom.name
        },
        kodeAnggaran: v.PermintaanBarangBarangKodeAnggaran.map((v) => v.kodeAnggaranId),
        status: v.status
      }))

      // TODO: 
      const canUpdate = userId === atasanId && status === getStatus(STATUS.PENGAJUAN.id).id

      return {
        id,
        no,
        tanggal: createdAt.toLocaleDateString('id-ID'),
        perihal,
        ruang,
        status,
        pemohon: {
          name,
          image,
          title,
          department,
        },
        barang,
        canUpdate
      }
    }),
  create: protectedProcedure
    .input(z.object({
      no: z.string(),
      perihal: z.string(),
      ruangId: z.string(),
      barang: z.array(z.object({
        id: z.string(),
        qty: z.string(),
        uomId: z.string(),
        kodeAnggaran: z.array(z.string())
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        no,
        perihal,
        ruangId,
        barang
      } = input
      const pemohondId = ctx.session.user.id

      try {
        await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.create({
            data: {
              no,
              perihal,
              ruangId,
              status: STATUS.PENGAJUAN.id,
              pemohondId
            }
          })

          for (const b of barang) {
            const {
              id,
              qty,
              uomId,
              kodeAnggaran
            } = b

            const pbbId = await tx.permintaanBarangBarang.create({
              data: {
                barangId: id,
                status: 'waiting',
                permintaanId: pb.id,
                qty: Number(qty),
                qtyOrdered: 0,
                qtyOut: 0,
                uomId
              }
            })

            await tx.permintaanBarangBarangKodeAnggaran.createMany({
              data: kodeAnggaran.map((v) => {
                return {
                  kodeAnggaranId: v,
                  pbbId: pbbId.id
                }
              })
            })
          }
        })

        return {
          ok: true,
          message: "Berhasil membuat permintaan barang"
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "No Internal Memo ini sudah terdaftar, harap ubah.",
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
  approve: protectedProcedure
    .input(z.object({
      id: z.string(),
      update: z.array(z.object({
        id: z.string(),
        qty: z.string(),
        uomId: z.string(),
        catatan: z.string()
      })).nullable(),
      reject: z.array(z.object({
        id: z.string(),
        catatan: z.string()
      })).nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        update,
        reject
      } = input

      const userId = ctx.session.user.id
      const user = await ctx.db.user.findUnique({
        where: {
          id: userId
        },
        include: {
          UserRole: true
        }
      })

      const res = await ctx.db.permintaanBarang.findUnique({
        where: {
          id
        },
        include: {
          Pemohon: true
        }
      })

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permintaan Barang ini tidak ada",
        });
      }

      const isAtasan = res.Pemohon.atasanId === userId && res.status === getStatus(STATUS.PENGAJUAN.id).id
      const canEdit = user?.UserRole.some((v) => v.id === ROLE.IM_APPROVE.id) && res.status === getStatus(STATUS.ATASAN_SETUJU.id).id

      const status = isAtasan ? STATUS.ATASAN_SETUJU.id : STATUS.IM_APPROVE.id

      if (!isAtasan && !canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak punya hak untuk melakukan ini",
        });
      }

      try {
        await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.update({
            where: { id },
            data: {
              status: status
            },
            include: {
              PermintaanBarangBarang: true
            }
          })
          const updateRejectBarangs = [...(update ?? []), ...(reject ?? [])].map((v) => v.id)
          const untouchedBarangs = pb.PermintaanBarangBarang.filter((v) => !updateRejectBarangs.includes(v.id))

          if (untouchedBarangs.length > 0) {
            for (const iterator of untouchedBarangs) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status,
                }
              })
              await tx.permintaanBarangBarangHistory.createMany({
                data: untouchedBarangs.map((v) => ({
                  pbbId: v.id,
                  desc: "Setuju",
                  status
                }))
              })
            }
          }

          if (update) {
            for (const iterator of update) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status,
                  qty: Number(iterator.qty),
                  uomId: iterator.uomId
                }
              })
            }
            await tx.permintaanBarangBarangHistory.createMany({
              data: update.map((v) => ({
                pbbId: v.id,
                // TODO: TO STRING REACT ELEMENT
                desc: "Menyetujui dan melakukan perubahan barang",
                status
              }))
            })
          }

          if (reject) {
            for (const iterator of reject) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status: isAtasan ? 'Ditolak atasan' : "Ditolak",
                }
              })
            }

            await tx.permintaanBarangBarangHistory.createMany({
              data: reject.map((v) => ({
                pbbId: v.id,
                desc: v.catatan,
                status: isAtasan ? 'Ditolak atasan' : "Ditolak",
              }))
            })
          }
        })
        return {
          ok: true,
          message: "Berhasil membuat permintaan barang"
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
