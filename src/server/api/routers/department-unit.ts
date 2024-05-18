import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const departmentUnitRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.departmentUnit.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Department: true
        }
      })

      return result.map((v) => ({
        ...v,
        department: v.Department.name
      }))
    }),
  getSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.departmentUnit.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: v.name,
        value: v.id,
        departmentId: v.departmentId
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      departmentId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        departmentId
      } = input

      try {
        await ctx.db.departmentUnit.create({
          data: {
            departmentId,
            name,
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah department unit'
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
      departmentId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        departmentId
      } = input

      try {

        await ctx.db.departmentUnit.update({
          where: {
            id
          },
          data: {
            name,
            departmentId
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah department unit'
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
        await ctx.db.departmentUnit.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus department unit'
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
