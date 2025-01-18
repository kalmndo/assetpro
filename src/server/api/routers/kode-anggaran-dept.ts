import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const kodeAnggaranDeptRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const kodeAnggaran = await ctx.db.masterKodeAnggaran.findFirst({
        where: {
          id
        }
      })

      const result = await ctx.db.masterKodeAnggaranDepartment.findMany({
        where: {
          kodeAnggaranId: id,
          deletedAt: null
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Department: true,
        }
      })

      const depts = await ctx.db.department.findMany({
        orderBy: {
          createdAt: "desc"
        },
      })

      const departments = depts.map((v) => ({
        label: v.name,
        value: v.id,
      }))



      const data = result.map((v) => ({
        id: v.id,
        name: v.Department.name,
        nilai: v.nilai ? v.nilai?.toLocaleString("id-ID") : "Rp 0"
      }))
      return {
        title: `${kodeAnggaran?.id} - ${kodeAnggaran?.name}`,
        data,
        departments
      }
    }),
  getSelectByUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const user = await ctx.db.user.findUnique({ where: { id: userId } })
      const result = await ctx.db.masterKodeAnggaranDepartment.findMany({
        where: {
          departmentId: user?.departmentId,
          deletedAt: { not: null }
        },
        include: {
          MasterKodeAnggaran: true
        },
        orderBy: {
          createdAt: "desc"
        },
      })

      return result.map((v) => ({
        label: `${v.MasterKodeAnggaran.id} - ${v.MasterKodeAnggaran.name}`,
        value: v.id,
      }))
    }),
  create: protectedProcedure
    .input(z.object({
      id: z.string(),
      departmentId: z.string(),
      nilai: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, departmentId, nilai } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.masterKodeAnggaranDepartment.create({
            data: {
              kodeAnggaranId: id,
              departmentId,
              nilai: Number(nilai),
              terpakai: 0
            }
          })
          await tx.masterKodeAnggaran.update({
            where: {
              id
            },
            data: {
              nilai: { increment: Number(nilai) }
            }
          })
        })
        return {
          ok: true,
          message: "Berhasil menambah departman kode anggaran"
        }
      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Terjadi kesalahan server, harap coba lagi"
        })

      }
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      try {

        await ctx.db.$transaction(async (tx) => {

          const res = await tx.masterKodeAnggaranDepartment.update({
            where: {
              id
            },
            data: {
              deletedAt: new Date()
            }
          })

          await tx.masterKodeAnggaran.update({
            where: {
              id: res.kodeAnggaranId
            },
            data: {
              nilai: { decrement: Number(res.nilai) }
            }
          })
        })
        return {
          ok: true,
          message: "Berhasil menghapus kode anggaran department"
        }

      } catch (error) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Terjadi kesalahan server, harap coba lagi"
        })
      }
    })
});
