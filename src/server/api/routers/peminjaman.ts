import getPenomoran from "@/lib/getPenomoran";
import PENOMORAN from "@/lib/penomoran";
import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const peminjamanRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          UserRole: true,
        },
      });
      const userRoles = user?.UserRole.map((v) => v.roleId);

      const res = await ctx.db.peminjaman.findFirst({
        where: {
          id,
        },
        include: {
          Barang: true,
          Ruang: true,
          Peminjam: {
            include: {
              Department: true,
              DepartmentUnit: true,
            },
          },
          PeminjamanHistory: true,
          PeminjamanAsetInternal: {
            include: {
              Aset: {
                include: {
                  Pengguna: true,
                },
              },
            },
          },
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini",
        });
      }
      const status = res.status;

      const isAtasanCanApprove =
        userId === res.Peminjam.atasanId && status === STATUS.PENGAJUAN.id;
      const isCanApprove =
        userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_APPROVE.id) &&
        status === STATUS.ATASAN_SETUJU.id;
      const isCanSendToUser =
        userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_SEND_TO_USER.id) &&
        status === STATUS.IM_APPROVE.id;
      const isUserCanReceive =
        userId === res.peminjamId && status === STATUS.DISERAHKAN_KE_USER.id;
      const isUserCanReturn =
        userId === res.peminjamId && status === STATUS.DIGUNAKAN.id;
      const isMalCanReceive =
        userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_RECEIVE_FROM_USER.id) &&
        status === STATUS.RETURNING.id;

      const peminjam = res.Peminjam;
      let listAvailableAsets: Prisma.DaftarAsetGetPayload<{
        include: { Pengguna: true; Ruang: true };
      }>[] = [];

      if (res.type) {
        const aset = await ctx.db.daftarAset.findMany({
          where: {
            barangId: res.Barang!.id,
            PeminjamanAsetInternal: {
              none: {
                from: {
                  lte: res.tglKembali,
                },
                to: {
                  gte: res.tglPinjam,
                },
              },
            },
            PeminjamanAsetEksternal: {
              none: {
                from: {
                  lte: res.tglKembali,
                },
                to: {
                  gte: res.tglPinjam,
                },
              },
            },
          },
          include: {
            Pengguna: true,
            Ruang: true,
          },
        });

        listAvailableAsets = aset;
      }

      return {
        id: res.id,
        no: res.no,
        tipe: res.type ? "Barang" : "Ruang",
        item: res.type ? res.Barang?.name : res.Ruang?.name,
        jumlah: res.jumlah,
        peminjam,
        peruntukan: res.peruntukan,
        from: res.tglPinjam.toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
        }),
        to: res.tglKembali.toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
        }),
        status: res.status,
        tanggal: res.createdAt.toLocaleDateString("id-ID"),
        riwayat: res.PeminjamanHistory,
        isAtasanCanApprove,
        isCanApprove,
        isCanSendToUser,
        isUserCanReceive,
        isUserCanReturn,
        isMalCanReceive,
        listAvailableAsets,
        asets: res.PeminjamanAsetInternal,
      };
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.peminjaman.findMany({
      where: {
        peminjamId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Barang: true,
        Ruang: true,
      },
    });

    const barangs = await ctx.db.masterPeminjamanBarang.findMany({
      include: {
        MasterBarang: true,
      },
    });
    const ruangs = await ctx.db.masterPeminjamanRuang.findMany({
      include: {
        MasterRuang: {
          include: {
            Peminjaman: true,
            PeminjamanExternal: true,
          },
        },
      },
    });
    const res = result?.map((v) => {
      const nama = v.barangId ? v.Barang?.name : v.Ruang?.name;
      return {
        id: v.id,
        no: v.no,
        type: v.type === 0 ? "Ruang" : "Barang",
        nama,
        peruntukan: v.peruntukan,
        status: v.status,
        tanggal: v.createdAt.toLocaleDateString("id-ID"),
        jadwalPinjam: `${v.tglPinjam.toLocaleDateString("id-ID")} - ${v.tglKembali.toLocaleDateString("id-ID")}`,
      };
    });

    return {
      value: res,
      data: {
        barangs: barangs.map((v) => ({
          label: v.MasterBarang.name,
          value: v.MasterBarang.id,
        })),
        ruangs: ruangs.map((v) => {
          const p = v.MasterRuang.Peminjaman.map((v) => ({
            from: v.tglPinjam,
            to: v.tglKembali,
          }));
          const px = v.MasterRuang.PeminjamanExternal.map((v) => ({
            from: v.tglPinjam,
            to: v.tglKembali,
          }));
          const booked = [...p, ...px];
          return {
            label: v.MasterRuang.name,
            value: v.MasterRuang.id,
            booked,
          };
        }),
      },
    };
  }),
  mGetAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.peminjaman.findMany({
      where: {
        NOT: { status: STATUS.PENGAJUAN.id },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Barang: true,
        Ruang: true,
      },
    });

    return result.map((v) => {
      const nama = v.barangId ? v.Barang?.name : v.Ruang?.name;
      return {
        id: v.id,
        no: v.no,
        type: v.type === 0 ? "Ruang" : "Barang",
        nama,
        peruntukan: v.peruntukan,
        status: v.status,
        tanggal: v.createdAt.toLocaleDateString("id-ID"),
        jadwalPinjam: `${v.tglPinjam.toLocaleDateString("id-ID")} - ${v.tglKembali.toLocaleDateString("id-ID")}`,
      };
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        barangId: z.string(),
        ruangId: z.string(),
        peruntukan: z.string(),
        jumlah: z.string(),
        tglPinjam: z.date(),
        jamPinjam: z.string(),
        tglKembali: z.date(),
        jamKembali: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        type: typeString,
        barangId,
        ruangId,
        peruntukan,
        jumlah,
        tglPinjam: pin,
        jamPinjam,
        tglKembali: kem,
        jamKembali,
      } = input;

      const [jp, mp] = jamPinjam.split(":").map(Number);
      const [jk, mk] = jamKembali.split(":").map(Number);

      const tglPinjam = new Date(pin);
      const tglKembali = new Date(kem);

      tglPinjam.setHours(jp!, mp, 0, 0);
      tglKembali.setHours(jk!, mk, 0, 0);

      try {
        await ctx.db.$transaction(async (tx) => {
          const userId = ctx.session.user.id;
          const user = await tx.user.findFirst({ where: { id: userId } });
          const type = Number(typeString);

          const penomoran = await tx.penomoran.upsert({
            where: { id: PENOMORAN.IM, year: String(new Date().getFullYear()) },
            update: { number: { increment: 1 } },
            create: { id: PENOMORAN.IM, code: 'IM', number: 0, year: String(new Date().getFullYear()) },
          });


          const peminjaman = await tx.peminjaman.create({
            data: {
              no: getPenomoran(penomoran),
              type,
              ...(type === 0
                ? { ruangId }
                : { barangId, jumlah: Number(jumlah) }),
              peruntukan,
              tglPinjam,
              tglKembali,
              status: STATUS.PENGAJUAN.id,
              peminjamId: ctx.session.user.id,
            },
          });

          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan permintaan peminjaman ${peminjaman.no}</span></p>`;
          await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: user?.atasanId ?? userId,
              link: `/permintaan/peminjaman/${peminjaman.id}`,
              desc,
              isRead: false,
            },
          });
          await tx.peminjamanHistory.create({
            data: {
              peminjamanId: peminjaman.id,
              desc: "Permohonan peminjaman",
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil membuat permintan peminjaman",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  atasanApprove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Atasan Menyetujui",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menyetujui permintan peminjaman",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  atasanReject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        catatan: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, catatan } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Atasan menolak permintaan",
              catatan,
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menolak permintan peminjaman",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.IM_APPROVE.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Permohonan disetujui",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menyetujui permintan peminjaman",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  approveAset: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        asetIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, asetIds } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          const result = await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.IM_APPROVE.id,
            },
          });

          await tx.peminjamanAsetInternal.createMany({
            data: asetIds.map((v) => ({
              asetId: v,
              from: result.tglPinjam,
              to: result.tglKembali,
              peminjamanId: id,
            })),
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Permohonan disetujui",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menyetujui permintan peminjaman",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        catatan: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, catatan } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Permohonan ditolak",
              catatan,
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menolak permintan peminjaman",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  sendToUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.DISERAHKAN_KE_USER.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Menyerahkan ke pemohon",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menyerahkan ke pemohon",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  userReceive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.DIGUNAKAN.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Pemohon menerima",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menerima",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  userReturn: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.RETURNING.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Pemohon mengembalikan",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil membuat pengembalian",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  done: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id,
            },
            data: {
              status: STATUS.SELESAI.id,
            },
          });

          await tx.peminjamanHistory.create({
            data: {
              desc: "Barang telah di terima kembali",
              peminjamanId: id,
            },
          });
        });
        return {
          ok: true,
          message: "Terima",
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
