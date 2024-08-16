import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const peminjamanRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const {
        id
      } = input
      const userId = ctx.session.user.id
      const user = await ctx.db.user.findFirst({
        where: {
          id: userId
        },
        include: {
          UserRole: true
        }
      })
      const userRoles = user?.UserRole.map((v) => v.roleId)

      const res = await ctx.db.peminjaman.findFirst({
        where: {
          id
        },
        include: {
          Barang: true,
          Ruang: true,
          Peminjam: {
            include: {
              Department: true,
              DepartmentUnit: true
            }
          },
          PeminjamanHistory: true
        }
      })

      if (!res) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini"
        })
      }
      const status = res.status

      const isAtasanCanApprove = userId === res.Peminjam.atasanId && status === STATUS.PENGAJUAN.id
      const isCanApprove = userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_APPROVE.id) && status === STATUS.ATASAN_SETUJU.id
      const isCanSendToUser = userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_SEND_TO_USER.id) && status === STATUS.IM_APPROVE.id
      const isUserCanReceive = userId === res.peminjamId && status === STATUS.DISERAHKAN_KE_USER.id
      const isUserCanReturn = userId === res.peminjamId && status === STATUS.DIGUNAKAN.id
      const isMalCanReceive = userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_RECEIVE_FROM_USER.id) && status === STATUS.RETURNING.id

      const peminjam = res.Peminjam

      return {
        id: res.id,
        no: res.no,
        tipe: res.type ? "Barang" : "Ruang",
        item: res.type ? res.Barang?.name : res.Ruang?.name,
        jumlah: res.jumlah,
        peminjam,
        peruntukan: res.peruntukan,
        from: res.tglPinjam.toLocaleDateString("id-ID", { dateStyle: 'full' }),
        to: res.tglKembali.toLocaleDateString('id-ID', { dateStyle: "full" }),
        status: res.status,
        tanggal: res.createdAt.toLocaleDateString("id-ID"),
        riwayat: res.PeminjamanHistory,
        isAtasanCanApprove,
        isCanApprove,
        isCanSendToUser,
        isUserCanReceive,
        isUserCanReturn,
        isMalCanReceive
      }
    }),
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.peminjaman.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Barang: true,
          Ruang: true
        }
      })

      const barangs = await ctx.db.masterBarang.findMany()
      const ruangs = await ctx.db.masterRuang.findMany({
        include: {
          Peminjaman: true,
          PeminjamanExternal: true
        }
      })
      const res = result.map((v) => {
        const nama = v.barangId ? v.Barang?.name : v.Ruang?.name
        return ({
          id: v.id,
          no: v.no,
          type: v.type === 0 ? "Ruang" : "Barang",
          nama,
          peruntukan: v.peruntukan,
          status: v.status,
          tanggal: v.createdAt.toLocaleDateString("id-ID"),
          jadwalPinjam: `${v.tglPinjam.toLocaleDateString("id-ID")} - ${v.tglKembali.toLocaleDateString("id-ID")}`
        })
      })

      return {
        value: res,
        data: {
          barangs: barangs.map((v) => ({
            label: v.name,
            value: v.id
          })),
          ruangs: ruangs.map((v) => {
            const p = v.Peminjaman.map((v) => ({ from: v.tglPinjam, to: v.tglKembali }))
            const px = v.PeminjamanExternal.map((v) => ({ from: v.tglPinjam, to: v.tglKembali }))
            const booked = [...p, ...px]
            return ({
              label: v.name,
              value: v.id,
              booked
            })
          })
        }
      }
    }),
  mGetAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.peminjaman.findMany({
        where: {
          NOT: { status: STATUS.PENGAJUAN.id }
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          Barang: true,
          Ruang: true
        }
      })

      return result.map((v) => {
        const nama = v.barangId ? v.Barang?.name : v.Ruang?.name
        return ({
          id: v.id,
          no: v.no,
          type: v.type === 0 ? "Ruang" : "Barang",
          nama,
          peruntukan: v.peruntukan,
          status: v.status,
          tanggal: v.createdAt.toLocaleDateString("id-ID"),
          jadwalPinjam: `${v.tglPinjam.toLocaleDateString("id-ID")} - ${v.tglKembali.toLocaleDateString("id-ID")}`
        })
      })
    }),
  create: protectedProcedure
    .input(z.object({
      type: z.string(),
      barangId: z.string(),
      ruangId: z.string(),
      peruntukan: z.string(),
      jumlah: z.string(),
      date: z.object({
        from: z.date(),
        to: z.date()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        type: typeString,
        barangId,
        ruangId,
        peruntukan,
        jumlah,
        date: { from, to }
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          const userId = ctx.session.user.id
          const user = await tx.user.findFirst({ where: { id: userId } })
          const type = Number(typeString)

          const peminjaman = await tx.peminjaman.create({
            data: {
              no: Math.random().toString(),
              type,
              ...(type === 0 ? { ruangId } : { barangId, jumlah: Number(jumlah) }),
              peruntukan,
              tglPinjam: from,
              tglKembali: to,
              status: STATUS.PENGAJUAN.id,
              peminjamId: ctx.session.user.id
            },
          })
          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan permintaan peminjaman ${peminjaman.no}</span></p>`
          await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: user?.atasanId ?? userId,
              link: `/permintaan/peminjaman/${peminjaman.id}`,
              desc,
              isRead: false,
            }
          })
          await tx.peminjamanHistory.create({
            data: {
              peminjamanId: peminjaman.id,
              desc: "Permohonan peminjaman",
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil membuat permintan peminjaman'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  atasanApprove: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Atasan Menyetujui",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menyetujui permintan peminjaman'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  atasanReject: protectedProcedure
    .input(z.object({
      id: z.string(),
      catatan: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        catatan
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Atasan menolak permintaan",
              catatan,
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menolak permintan peminjaman'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  approve: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_APPROVE.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Permohonan disetujui",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menyetujui permintan peminjaman'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  reject: protectedProcedure
    .input(z.object({
      id: z.string(),
      catatan: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        catatan
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Permohonan ditolak",
              catatan,
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menolak permintan peminjaman'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  sendToUser: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {

          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.DISERAHKAN_KE_USER.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Menyerahkan ke pemohon",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menyerahkan ke pemohon'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  userReceive: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {

          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.DIGUNAKAN.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Pemohon menerima",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menerima'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  userReturn: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {

          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.RETURNING.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Pemohon mengembalikan",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil membuat pengembalian'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  done: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {

          await tx.peminjaman.update({
            where: {
              id
            },
            data: {
              status: STATUS.SELESAI.id
            }
          })

          await tx.peminjamanHistory.create({
            data: {
              desc: "Barang telah di terima kembali",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Terima'
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
