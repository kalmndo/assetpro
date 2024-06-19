import { ROLE } from "@/lib/role";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mEvaluasiRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterEvaluasiUser.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          User: true
        }
      })

      const users = await ctx.db.user.findMany({
        where: {
          UserRole: {
            some: {
              roleId: ROLE.EVALUASI_HARGA_APPROVE.id
            }
          },
          AND: {
            MasterEvaluasiUser: {
              every: {
                id: {
                  notIn: result.map((v) => v.id)
                }
              }
            }
          }
        },
      })

      return {
        result,
        users: users.map((v) => ({
          label: v.name,
          value: v.id
        }))
      }
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterEvaluasiUser.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          User: true
        }
      })

      return result.map((v) => ({
        label: v.User.name,
        value: v.id,
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      userId: z.string(),
      nilai: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        userId,
        nilai
      } = input

      try {
        await ctx.db.masterEvaluasiUser.create({
          data: {
            userId,
            nilai: Number(nilai)
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah Master Evaluasi User'
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
      userId: z.string(),
      nilai: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        userId,
        nilai
      } = input

      try {

        await ctx.db.masterEvaluasiUser.update({
          where: {
            id
          },
          data: {
            userId,
            nilai: Number(nilai)
          }
        })
        return {
          ok: true,
          message: 'Berhasil mengubah Master Evaluasi User'
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
        await ctx.db.masterEvaluasiUser.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus Master Evaluasi User'
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
