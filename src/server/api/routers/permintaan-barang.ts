import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

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

      try {
        await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.create({
            data: {
              no,
              perihal,
              ruangId,
              status: 'waiting',
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
});
