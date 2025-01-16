import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const teknisiRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.teknisi.findMany({
        where: {
          isActive: 1
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          User: true
        }
      })

      const users = await ctx.db.user.findMany({
        where: {
          id: { notIn: result.map((v) => v.User.id) }
        }
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
      const result = await ctx.db.teknisi.findMany({
        where: {
          isActive: 1
        },
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
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input

      try {
        await ctx.db.teknisi.upsert({
          where: {
            id
          },
          create: {
            id
          },
          update: {
            isActive: 1
          }
        })
        return {
          ok: true,
          message: 'Berhasil menambah teknisi'
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
        await ctx.db.teknisi.update({
          where: { id },
          data: {
            isActive: 0
          }
        })
        return {
          ok: true,
          message: 'Berhasil menghapus teknisi'
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
