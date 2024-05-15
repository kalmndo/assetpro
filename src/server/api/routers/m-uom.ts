import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const mUomRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterUnit.findMany({
        orderBy: {
          createdAt: "desc"
        },

      })

      return result
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.masterUnit.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
      } = input

      try {
        await ctx.db.masterUnit.create({
          data: {
            name,
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah satuan'
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
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
      } = input

      try {

        await ctx.db.masterUnit.update({
          where: {
            id
          },
          data: {
            name
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah satuan'
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
        await ctx.db.masterUnit.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus satuan'
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
