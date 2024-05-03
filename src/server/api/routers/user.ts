import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from 'bcryptjs'

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.user.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Department: true,
          UserRole: true
        }
      })

      return result.map((v) => ({
        ...v,
        role: 'asdf',
        department: v.Department.name
      }))
    }),

  getAtasanSelect: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id
      const result = await ctx.db.user.findMany({
        where: {
          id: { not: userId }
        },
        include: {
          Department: true
        }
      })

      return result.map((v) => ({
        label: `${v.name} - ${v.title} - ${v.Department.name}`,
        value: v.id
      }))
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string(),
      department: z.string(),
      title: z.string(),
      atasan: z.string(),
      role: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        email,
        department,
        atasan,
        role,
        title
      } = input
      const password = await bcrypt.hash("asdf1234", 10);
      try {
        await ctx.db.user.create({
          data: {
            name,
            email,
            departmentId: department,
            atasanId: atasan ? atasan : undefined,
            password,
            title,
            UserRole: {
              createMany: role.length > 0 ? {
                data: role.map((v) => ({
                  roleId: v
                }))
              } : undefined
            }
          },
        })
        return {
          ok: true,
          message: 'Berhasil menambah user'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Email ini sudah terdaftar, harap ubah.",
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
      email: z.string(),
      department: z.string(),
      title: z.string(),
      atasan: z.string().nullable(),
      role: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        email,
        department,
        atasan,
        role,
        title
      } = input

      try {

        await ctx.db.$transaction(async (tx) => {
          const result = await tx.user.update({
            where: { id },
            data: {
              name,
              email,
              departmentId: department,
              atasanId: atasan ?? undefined,
              title
            },
            include: { UserRole: true }
          })

          const rolesToDelete = result.UserRole
            .filter(v => !role.includes(v.roleId))
            .map(v => v.id);

          const existingRoleIds = result.UserRole.map(role => role.roleId);
          const rolesToCreate = role.filter(roleId => !existingRoleIds.includes(roleId));
          if (rolesToCreate.length > 0) {
            await tx.userRole.createMany({
              data: rolesToCreate.map((v) => ({ roleId: v, userId: id }))
            })
          }

          if (rolesToDelete.length > 0) {
            for (const deleteId of rolesToDelete) {
              await tx.userRole.delete({
                where: {
                  id: deleteId
                }
              })
            }
          }

        })

        return {
          ok: true,
          message: 'Berhasil mengubah user'
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Email ini sudah terdaftar, harap ubah.",
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
        await ctx.db.user.delete({
          where: { id },
        })
        return {
          ok: true,
          message: 'Berhasil menghapus user'
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
