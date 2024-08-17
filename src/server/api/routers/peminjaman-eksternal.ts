import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const peminjamanEksternalRouter = createTRPCRouter({
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

      const res = await ctx.db.peminjamanExternal.findFirst({
        where: {
          id
        },
        include: {
          Barang: true,
          Ruang: true,
          Pemohon: {
            include: {
              Department: true,
              DepartmentUnit: true
            }
          },
          PeminjamanExternalHistory: true,
          PeminjamanAsetEksternal: {
            include: {
              Aset: {
                include: {
                  Pengguna: true
                }
              }
            }
          }
        }
      })

      if (!res) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini"
        })
      }
      const status = res.status

      const isCanApprove = userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_APPROVE.id) && status === STATUS.PENGAJUAN.id
      const isCanSendToUser = userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_SEND_TO_USER.id) && status === STATUS.IM_APPROVE.id
      const isMalCanReceive = userRoles?.includes(ROLE.PEMINJAMAN_INTERNAL_RECEIVE_FROM_USER.id) && status === STATUS.DIGUNAKAN.id

      const pemohon = res.Pemohon

      let listAvailableAsets: Prisma.DaftarAsetGetPayload<{ include: { Pengguna: true } }>[] = []

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
                }
              }
            },
            PeminjamanAsetEksternal: {
              none: {
                from: {
                  lte: res.tglKembali,
                },
                to: {
                  gte: res.tglPinjam,
                }
              }
            }
          },
          include: {
            Pengguna: true
          }
        })

        listAvailableAsets = aset
      }

      return {
        id: res.id,
        no: res.no,
        tipe: res.type ? "Barang" : "Ruang",
        item: res.type ? res.Barang?.name : res.Ruang?.name,
        jumlah: res.jumlah,
        pemohon,
        peruntukan: res.peruntukan,
        from: res.tglPinjam.toLocaleDateString("id-ID", { dateStyle: 'full' }),
        to: res.tglKembali.toLocaleDateString('id-ID', { dateStyle: "full" }),
        status: res.status,
        tanggal: res.createdAt.toLocaleDateString("id-ID"),
        riwayat: res.PeminjamanExternalHistory,
        isCanApprove,
        isCanSendToUser,
        isMalCanReceive,
        peminjam: res.peminjam,
        biaya: "Rp" + " " + res.biaya.toLocaleString('id-ID'),
        listAvailableAsets,
        asets: res.PeminjamanAsetEksternal
      }
    }),
  getAll: protectedProcedure
    .query(async ({ ctx }) => {

      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id
        },
        include: {
          UserRole: true
        }
      })

      const userRoles = user?.UserRole.map((v) => v.roleId)

      const result = await ctx.db.peminjamanExternal.findMany({
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

      const isCanCreate = userRoles?.includes(ROLE.PEMINJAMAN_EKSTERNAL_CREATE.id)

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
          jadwalPinjam: v.tglPinjam.toLocaleDateString("id-ID"),
          biaya: "Rp" + " " + v.biaya.toLocaleString('id-ID')
        })
      })

      return {
        value: res,
        isCanCreate,
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
  create: protectedProcedure
    .input(z.object({
      type: z.string(),
      barangId: z.string(),
      ruangId: z.string(),
      peminjam: z.string(),
      peruntukan: z.string(),
      jumlah: z.string(),
      date: z.object({
        from: z.date(),
        to: z.date()
      }),
      biaya: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        type: typeString,
        barangId,
        ruangId,
        peruntukan,
        jumlah,
        date: { from, to },
        peminjam,
        biaya
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          const userId = ctx.session.user.id

          const userResult = await tx.user.findUnique({
            where: {
              id: userId
            }
          })

          const userRolesResult = await tx.userRole.findMany({
            where: {
              roleId: {
                in: [ROLE.PEMINJAMAN_EKSTERNAL_APPROVE.id]
              }
            },
            include: {
              user: true
            }
          })

          const type = Number(typeString)

          const peminjaman = await tx.peminjamanExternal.create({
            data: {
              no: Math.random().toString(),
              type,
              ...(type === 0 ? { ruangId } : { barangId, jumlah: Number(jumlah) }),
              peruntukan,
              tglPinjam: from,
              tglKembali: to,
              status: STATUS.PENGAJUAN.id,
              peminjam,
              biaya: Number(biaya),
              pemohonId: userId
            },
          })

          for (const { user } of userRolesResult) {
            const desc = `<p class="text-sm font-semibold">${userResult?.name}<span class="font-normal ml-[5px]">Meminta persetujuan permintaan peminjaman eksternal ${peminjaman.no}</span></p>`

            await tx.notification.create({
              data: {
                fromId: userId,
                toId: user.id,
                link: `/peminjaman/eksternal/${peminjaman.id}`,
                desc,
                isRead: false,
              }
            })
          }

          await tx.peminjamanExternalHistory.create({
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
          await tx.peminjamanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_APPROVE.id
            }
          })

          await tx.peminjamanExternalHistory.create({
            data: {
              desc: "Permohonan disetujui",
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menyetujui permintan peminjaman eksternal'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  approveAset: protectedProcedure
    .input(z.object({
      id: z.string(),
      asetIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        asetIds
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          const result = await tx.peminjamanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_APPROVE.id
            }
          })

          await tx.peminjamanAsetEksternal.createMany({
            data: asetIds.map((v) => ({
              asetId: v,
              from: result.tglPinjam,
              to: result.tglKembali,
              peminjamanId: id
            }))
          })

          await tx.peminjamanExternalHistory.create({
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
          await tx.peminjamanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_REJECT.id
            }
          })

          await tx.peminjamanExternalHistory.create({
            data: {
              desc: "Permohonan ditolak",
              catatan,
              peminjamanId: id
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menolak permintan peminjaman eksternal'
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

          await tx.peminjamanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.DIGUNAKAN.id
            }
          })

          await tx.peminjamanExternalHistory.create({
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

          await tx.peminjamanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.SELESAI.id
            }
          })

          await tx.peminjamanExternalHistory.create({
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
