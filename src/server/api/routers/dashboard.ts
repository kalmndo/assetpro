import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.department.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Organisasi: true
        }
      })
      return result.map((v) => ({
        ...v,
        organisasi: v.Organisasi.name,
      }))
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.department.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
        organisasiId: v.organisasiId
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      organisasiId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        organisasiId
      } = input

      try {
        await ctx.db.department.create({
          data: {
            organisasiId,
            name,
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah department'
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
      organisasiId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        organisasiId
      } = input

      try {

        await ctx.db.department.update({
          where: {
            id
          },
          data: {
            name,
            organisasiId
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah department'
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
        await ctx.db.department.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus department'
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
