import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const perbaikanRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const userId = ctx.session.user.id

      const user = await ctx.db.user.findFirst({
        where: {
          id: userId
        },
        include: {
          UserRole: true,
          Teknisi: true
        }
      })


      const result = await ctx.db.perbaikan.findFirst({
        where: {
          id
        },
        include: {
          Aset: {
            include: { MasterBarang: true }
          },
          User: {
            include: { Department: true, DepartmentUnit: true }
          },
          Teknisi: {
            include: { User: true }
          },
          PerbaikanKomponen: {
            orderBy: { createdAt: 'desc' },
            include: { Barang: true }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini"
        });
      }

      const isCanSelectTeknisi = user?.UserRole.map((v) => v.roleId).some((v) => v === ROLE.SELECT_TEKNISI.id) && result.status === STATUS.ATASAN_SETUJU.id
      const isAtasanCanApprove = result.User.atasanId === userId && result.status === STATUS.PENGAJUAN.id
      const isTeknisiCanAccept = userId === result.teknisiId && result.status === STATUS.TEKNISI_DISPOSITION.id
      const isTeknisiCanDone = userId === result.teknisiId && result.status === STATUS.TEKNISI_FIXING.id
      // teknisi mengeksekusi
      // teknisi selesai

      const p = result.User
      const b = result.Aset.MasterBarang

      const comps = result.PerbaikanKomponen.map((v) => ({
        id: v.id,
        type: v.type,
        name: v.name,
        jumlah: v.jumlah,
        biaya: `Rp ${v.biaya.toLocaleString("id-ID")}`,
        b: v.biaya
      }))

      const totalComps = comps.map((v) => v.b).reduce((a, b) => a + b, 0)

      return {
        id: result.id,
        no: result.no,
        tanggal: result.createdAt.toLocaleDateString(),
        keluhan: result.keluhan,
        status: result.status,
        pemohon: {
          id: p.id,
          name: p.name,
          image: p.image,
          title: p.title,
          department: p.Department.name,
          departmentUnit: p.DepartmentUnit?.name
        },
        teknisi: result.Teknisi?.User.name,
        barang: {
          id: b.id,
          name: b.name,
          image: b.image,
          deskripsi: b.deskripsi,
          noInv: result.Aset.id
        },
        isAtasanCanApprove,
        isCanSelectTeknisi,
        isTeknisiCanAccept,
        isTeknisiCanDone,
        components: comps.length === 0 ? [] : [...comps, { id: "total", type: "", biaya: `Rp ${totalComps.toLocaleString("id-ID")}`, jumlah: '', name: "" }]
      }
    }),
  addComponent: protectedProcedure
    .input(z.object({
      perbaikanId: z.string(),
      type: z.string(),
      name: z.string(),
      barangId: z.string(),
      biaya: z.string(),
      jumlah: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        perbaikanId,
        type,
        name,
        barangId,
        biaya,
        jumlah
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {

          if (type === '0') {
            // await tx.perbaikanKomponen.create({
            //   data: {
            //     type

            //   }

            // })
          } else {
            await tx.perbaikanKomponen.create({
              data: {
                perbaikanId,
                type: Number(type),
                name,
                biaya: Number(biaya),
                jumlah: Number(jumlah)
              }
            })
          }
        })
        return {
          ok: true,
          message: "Berhasil menambah komponen perbaikan"
        }

      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }

    }),
  getAll: protectedProcedure
    .input(z.object({
      isUser: z.boolean()
    }))
    .query(async ({ ctx, input }) => {
      const { isUser } = input

      let findMany;

      if (isUser) {
        findMany = {
          where: {
            // @ts-ignore
            userId: ctx.session.user.id
          },
          orderBy: {
            createdAt: "desc" as any
          },
          include: {
            Aset: {
              include: {
                MasterBarang: true
              }
            }
          }
        }
      } else {
        findMany = {
          where: {
            // @ts-ignore
            NOT: { status: STATUS.PENGAJUAN.id }
          },
          orderBy: {
            createdAt: "desc"
          },
          include: {
            Aset: {
              include: {
                MasterBarang: true
              }
            }
          }
        }
      }

      // @ts-ignore
      const result = await ctx.db.perbaikan.findMany(findMany)

      return result
    }),
  create: protectedProcedure
    .input(z.object({
      asetId: z.string(),
      keluhan: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        asetId,
        keluhan
      } = input
      const userId = ctx.session.user.id

      try {
        await ctx.db.$transaction(async (tx) => {
          const user = await tx.user.findFirst({
            where: { id: userId }
          })

          const perbaikan = await tx.perbaikan.create({
            data: {
              no: Math.random().toString(),
              userId,
              keluhan,
              asetId,
              status: STATUS.PENGAJUAN.id
            },
          })

          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan permintaan perbaikan ${perbaikan.no}</span></p>`
          await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: user?.atasanId ?? userId,
              link: `/permintaan/perbaikan/${perbaikan.id}`,
              desc,
              isRead: false,
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil meminta permohonan perbaikan'
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
      const { id } = input
      try {
        // ganti status jadi disetujui atasan
        // create history perbaikan
        await ctx.db.$transaction(async (tx) => {
          await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id
            }
          })
          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: 'Atasan menyetujui permintaan perbaikan'
            }
          })
        })

        return {
          ok: true,
          message: 'Berhasil menyetujui permintaan perbaikan'
        }


      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  selectTeknisi: protectedProcedure
    .input(z.object({
      id: z.string(),
      teknisiId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        teknisiId
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const teknisi = await tx.teknisi.findFirst({
            where: { id: teknisiId },
            include: {
              User: true
            }
          })

          await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              teknisiId,
              status: STATUS.TEKNISI_DISPOSITION.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: 'Diserahkan ke teknisi',
              catatan: teknisi?.User.name
            }
          })
        })

        return {
          ok: true,
          message: "Berhasil menyerahkan ke teknisi"
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
          await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_REJECT.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Atasan menolak permintaan perbaikan`,
              catatan
            }
          })
        })
        return {
          ok: true,
          message: "Berhasil menolak permintaan perbaikan"
        }

      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  teknisiTerima: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              status: STATUS.TEKNISI_FIXING.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Teknisi menenrima barang dan memperbaiki barang`,
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menerima barang'
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

        await ctx.db.department.update({
          where: {
            id
          },
          data: {
            name
          },
        })
        return {
          ok: true,
          message: 'Berhasil mengubah organisasi'
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
          message: 'Berhasil menghapus organisasi'
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
