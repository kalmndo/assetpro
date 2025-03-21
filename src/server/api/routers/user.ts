import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        UserRole: true,
        NotificationTo: {
          include: {
            From: true,
          },
          orderBy: [
            { isRead: "asc" }, // Sort by `isRead` first
            { createdAt: "desc" }, // Then sort by `createdAt`
          ],
        },
      },
    });
    if (!user) {
      return {
        ok:false,
        data: undefined
      }
    }
    return {
      ok: true,
      data: {
        ...user,
        image: user.image ?? "",
        notifications: user.NotificationTo,
        userRoles: user.UserRole.map((v) => v.roleId),
      }
    };
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Department: {
          include: {
            Organisasi: true,
          },
        },
        DepartmentUnit: true,
        UserRole: {
          include: {
            role: true,
          },
        },
      },
    });

    return result.map((v) => ({
      ...v,
      role: v.UserRole.map((v) => v.role.id),
      organisasi: v.Department.Organisasi.name,
      department: v.Department.name,
      unit: v.DepartmentUnit?.name,
    }));
  }),

  getAtasanSelect: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.user.findMany({
      include: {
        Department: true,
      },
    });

    return result.map((v) => ({
      label: `${v.name} - ${v.title} - ${v.Department.name}`,
      value: v.id,
    }));
  }),
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userName = ctx.session.user.name;

    const userRoles = await ctx.db.userRole.findMany({ where: { userId } });
    const userRoleIds = userRoles.map((v) => v.roleId);

    const isRole = userRoles.length > 0;

    const per = await ctx.db.permintaanBarang.findMany({
      where: { pemohondId: userId },
      orderBy: { createdAt: "desc" },
    });
    const pem = await ctx.db.peminjaman.findMany({
      where: { peminjamId: userId },
      orderBy: { createdAt: "desc" },
    });
    const perb = await ctx.db.perbaikan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    // const pers = await ctx.db.permintaanBarang.findMany({where: {}})

    const al = [...per, ...pem, ...perb].sort(
      // @ts-ignore
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );

    const {
      IM_READ,
      GUDANG_REQUEST_VIEW,
      PEMBELIAN_READ,
      PENAWARAN_VIEW,
      NEGO_VIEW,
      EVALUASI_HARGA_READ,
    } = ROLE;

    const permintaanBarangRole = [IM_READ.id, GUDANG_REQUEST_VIEW.id];
    const pengadaanRole = [
      PEMBELIAN_READ.id,
      PENAWARAN_VIEW.id,
      NEGO_VIEW.id,
      EVALUASI_HARGA_READ.id,
    ];

    const overview = {
      permintaan: per.length,
      peminjaman: pem.length,
      perbaikan: perb.length,
      persetujuan: 0,
      recent: al.slice(0, 4),
      persetujuanRecent: [],
    };

    if (isRole) {
      // permintaan barang
      const result = {};
      if (userRoleIds.some((v) => permintaanBarangRole.includes(v))) {
        const approval = await ctx.db.permintaanBarang.findMany({
          where: { status: STATUS.IM_APPROVE.id },
        });

        const pbbg = await ctx.db.permintaanBarangBarangGroup.findMany();
        const { tersedia, takTersedia } = await checkKetersediaanByBarang(
          ctx.db,
          pbbg,
        );

        const data = {
          approval: approval.length,
          tersedia: tersedia.length,
          takTersedia: takTersedia.length,
          tolak: 0,
        };
        // @ts-ignore
        result.persetujuan = data;
      }

      // pengadaan
      //
      if (userRoleIds.some((v) => pengadaanRole.includes(v))) {
        const pembelian = await ctx.db.permintaanPembelian.findMany({
          where: { status: STATUS.PENGAJUAN.id },
        });
        const penawaran = await ctx.db.permintaanPenawaran.findMany({
          where: { status: STATUS.PENGAJUAN.id },
        });
        const nego = await ctx.db.penawaranHarga.findMany({
          where: { status: STATUS.PENGAJUAN.id },
        });
        const evaluasi = await ctx.db.evaluasi.findMany({
          where: { status: STATUS.PENGAJUAN.id },
        });

        const data = {
          pembelian: pembelian.length,
          penawaran: penawaran.length,
          nego: nego.length,
          evaluasi: evaluasi.length,
        };
        // @ts-ignore
        result.pengadaan = data;
      }

      return {
        isUser: false,
        name: userName,
        overview,
        // @ts-ignore
        persetujuan: result.persetujuan,
        // @ts-ignore
        pengadaan: result.pengadaan,
      };
    }

    return {
      isUser: true,
      name: userName,
      overview,
    };
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string().nullable(),
        departmentUnitId: z.string().nullable(),
        email: z.string(),
        department: z.string(),
        title: z.string(),
        atasan: z.string(),
        role: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        image,
        email,
        department,
        departmentUnitId,
        atasan,
        role,
        title,
      } = input;
      const password = await bcrypt.hash("asdf1234", 10);

      try {
        await ctx.db.user.create({
          data: {
            name,
            image,
            email,
            departmentId: department,
            atasanId: atasan ? atasan : undefined,
            password,
            title,
            departmentUnitId: departmentUnitId ? departmentUnitId : undefined,
            UserRole: {
              createMany:
                role.length > 0
                  ? {
                    data: role.map((v) => ({
                      roleId: v,
                    })),
                  }
                  : undefined,
            },
          },
        });
        return {
          ok: true,
          message: "Berhasil menambah user",
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Email ini sudah terdaftar, harap ubah.",
              cause: error,
            });
          }
        }
        console.log("err", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        image: z.string().nullable(),
        email: z.string(),
        department: z.string(),
        departmentUnitId: z.string().nullable(),
        title: z.string(),
        atasan: z.string().nullable(),
        role: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        image,
        email,
        department,
        departmentUnitId,
        atasan,
        role,
        title,
      } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          const result = await tx.user.update({
            where: { id },
            data: {
              name,
              image,
              email,
              departmentUnitId,
              departmentId: department,
              atasanId: atasan ?? undefined,
              title,
            },
            include: { UserRole: true },
          });

          const rolesToDelete = result.UserRole.filter(
            (v) => !role.includes(v.roleId),
          ).map((v) => v.id);

          const existingRoleIds = result.UserRole.map((role) => role.roleId);
          const rolesToCreate = role.filter(
            (roleId) => !existingRoleIds.includes(roleId),
          );
          if (rolesToCreate.length > 0) {
            await tx.userRole.createMany({
              data: rolesToCreate.map((v) => ({ roleId: v, userId: id })),
            });
          }

          if (rolesToDelete.length > 0) {
            for (const deleteId of rolesToDelete) {
              await tx.userRole.delete({
                where: {
                  id: deleteId,
                },
              });
            }
          }
        });

        return {
          ok: true,
          message: "Berhasil mengubah user",
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
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
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.user.delete({
          where: { id },
        });
        return {
          ok: true,
          message: "Berhasil menghapus user",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
});
