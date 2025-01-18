import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const kodeAnggaranRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterKodeAnggaran.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: "desc"
        },
      })
      return result.map((v) => ({
        kode: v.id,
        name: v.name,
        nilai: v.nilai ? `Rp ${v.nilai?.toLocaleString("id-ID")}` : "Rp 0"
      }))
    }),
  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.masterKodeAnggaran.update({
            where: {
              id
            },
            data: {
              deletedAt: new Date()
            }
          })

          await tx.masterKodeAnggaranDepartment.updateMany({
            where: {
              kodeAnggaranId:id
            },
            data: {
              deletedAt: new Date()
            }
          })
        })

        return {
          ok: true,
          message: "Berhasil menghapus kode anggaran"
        }

      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Terjadi kesalahan server, harap coba lagi"
        })

      }

    })
});
