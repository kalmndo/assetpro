import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.user.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Department: true
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

      try {
        return await ctx.db.user.create({
          data: {
            name,
            email,
            departmentId: department,
            atasanId: atasan,
            password: 'asdf',
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

    })
});
