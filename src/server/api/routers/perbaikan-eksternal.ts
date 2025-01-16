import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { STATUS } from "@/lib/status";
import { ROLE } from "@/lib/role";

// permohanan perbaikan eksternal 
// disetujui oleh sadat atau di tolak | Permohonan eksternal disetujui
// minta invoice
// invoice ada | input invoice
// persetujuan harga
// jika setuju lakukan perbaikan
// jika tolak barang rusak
// barang di terima di gudang
// user terima

export const perbaikanEksternalRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
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

      const result = await ctx.db.perbaikanExternal.findFirst({
        where: {
          id
        },
        include: {
          PerbaikanEksternalKomponen: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          PerbaikanExternalFiles:true,
          Vendor: true,
          PerbaikanExternalHistory: true,
          Perbaikan: {
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
                include: { Barang: { include: { Barang: true, Permintaan: true } } }
              },
              PerbaikanHistory: true
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini"
        });
      }

      // evaluasi harga penawaran

      const isAtasanCanApprove = user?.UserRole.map((v) => v.roleId).some((v) => v === ROLE.PERBAIKAN_EKSTERNAL_APPROVE.id) && result.status === STATUS.PENGAJUAN.id
      const canSendToVendor = user?.UserRole.map((v) => v.roleId).some((v) => v === ROLE.PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_VENDOR.id) && result.status === STATUS.IM_APPROVE.id
      const canReceiveFromVendor = user?.UserRole.map((v) => v.roleId).some((v) => v === ROLE.PERBAIKAN_EKSTERNAL_TERIMA.id) && result.status === STATUS.PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_VENDOR.id
      const canSendToUser = user?.UserRole.map((v) => v.roleId).some((v) => v === ROLE.PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_USER.id) && result.status === STATUS.PERBAIKAN_EKSTERNAL_TERIMA.id
      const canAddComponents = user?.UserRole.map((v) => v.roleId).some((v) => v === ROLE.PERBAIKAN_EKSTERNAL_ADD_COMPONENT.id) && result.status === STATUS.PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_VENDOR.id

      // const p = result.Perbaikan.User
      const b = result.Perbaikan.Aset.MasterBarang

      const comps = result.PerbaikanEksternalKomponen.map((v) => {
        return {
          id: v.id,
          name: v.name,
          jumlah: v.jumlah,
          biaya: `Rp ${v.biaya.toLocaleString("id-ID")}`,
          b: v.biaya
        }
      })


      const totalComps = comps.map((v) => v.b).reduce((a, b) => a + b, 0)

      return {
        id: result.id,
        no: result.no,
        tanggal: result.createdAt.toLocaleDateString(),
        status: result.status,
        noPerbaikan: result.Perbaikan.no,
        vendor: {
          ...result.Vendor
        },
        teknisi: result.Perbaikan.Teknisi?.User.name,
        catatanTeknisi: result.Perbaikan.catatanTeknisi,
        barang: {
          id: b.id,
          name: b.name,
          image: b.image,
          deskripsi: b.deskripsi,
          noInv: result.Perbaikan.Aset.id
        },
        components: comps.length === 0 ? [] : [...comps, { id: "total", biaya: `Rp ${totalComps.toLocaleString("id-ID")}`, jumlah: '', name: "" }],
        riwayat: result.PerbaikanExternalHistory,
        files: result.PerbaikanExternalFiles ,
        isAtasanCanApprove,
        canAddComponents,
        canSendToVendor,
        canReceiveFromVendor,
        canSendToUser
      }
    }),
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.perbaikanExternal.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          Perbaikan: {
            include: {
              Teknisi: {
                include: {
                  User: true
                }
              },
              Aset: {
                include: {
                  MasterBarang: true
                }
              }
            }
          }
        }
      })

      return result.map((v) => {
        const b = v.Perbaikan.Aset.MasterBarang
        const t = v.Perbaikan.Teknisi?.User.name
        return ({
          id: v.id,
          no: v.no,
          barang: b.name,
          pemohon: t,
          tanggal: v.createdAt.toLocaleDateString(),
          status: v.status
        })
      })
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
          await tx.perbaikanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_APPROVE.id
            }
          })

          await tx.perbaikanExternalHistory.create({
            data: {
              desc: "Disetujui",
              perbaikanExternalId: id
            }
          })

        })
        return {
          ok: true,
          message: 'Berhasil menyetujui permintaan perbaikan eksternal'
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })

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
          const ex = await tx.perbaikanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.IM_REJECT.id
            }
          })

          await tx.perbaikanExternalHistory.create({
            data: {
              perbaikanExternalId: id,
              desc: "Ditolak ",
              catatan
            }
          })

          await tx.perbaikan.update({
            where: {
              id: ex.perbaikanId
            },
            data: {
              status: STATUS.TIDAK_SELESAI.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: ex.perbaikanId,
              desc: "Permintaan perbaikan eksternal ditolak",
              catatan,
            }
          })
          // TODO: daftar aset jadi idle dan rusak
        })
        return {
          ok: true,
          message: 'Berhasil menolak permintaan perbaikan eksternal'
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })

      }
    }),
  sendToVendor: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.perbaikanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_VENDOR.id
            }
          })

          await tx.perbaikanExternalHistory.create({
            data: {
              desc: "Diserahkan ke vendor",
              perbaikanExternalId: id
            }
          })

        })
        return {
          ok: true,
          message: 'Berhasil menyerahkan permintaan perbaikan eksternal ke vendor'
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })

      }
    }),
  addComponent: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      jumlah: z.string(),
      biaya: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        jumlah,
        biaya
      } = input

      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.perbaikanEksternalKomponen.create({
            data: {
              biaya: Number(biaya),
              jumlah: Number(jumlah),
              name,
              perbaikanExternalId: id
            }
          })
        })

        return {
          ok: true,
          message: "Berhasil menambah komponen"
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })
      }
    }),
  receiveFromVendor: protectedProcedure
    .input(z.object({
      id: z.string(),
      type: z.string(),
      files: z.array(z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        url: z.string()
      })).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        type,
        files
      } = input

      const isDone = type === '0' ? false : true

      try {
        await ctx.db.$transaction(async (tx) => {

          if (files) {
            await tx.perbaikanExternalFiles.createMany({
              data: files.map((v) => ({
                perbaikanExternalId: id,
                name: v.name,
                url: v.url,
                type: v.type,
                size: v.size
              }))
            })
          }
          if (isDone) {
            await tx.perbaikanExternal.update({
              where: {
                id
              },
              data: {
                status: STATUS.PERBAIKAN_EKSTERNAL_TERIMA.id
              }
            })

            await tx.perbaikanExternalHistory.create({
              data: {
                desc: "Barang telah diterima di gudang",
                perbaikanExternalId: id
              }
            })
          } else {
            const ex = await tx.perbaikanExternal.update({
              where: {
                id
              },
              data: {
                status: STATUS.TIDAK_SELESAI.id
              }
            })
            // diterima 
            //  selesai
            //    status perbaikan? gak ada status
            //    status eksternal terima selesai tapi belum dikirim ke user
            //    kirim ke user/ teknisi
            //  
            //  
            const res = await tx.perbaikan.update({
              where: {
                id: ex.perbaikanId
              },
              data: {
                status: STATUS.TIDAK_SELESAI.id
              }
            })

            await tx.daftarAset.update({
              where: {
                id: res.asetId
              },
              data: {
                status: STATUS.ASET_BROKE.id
              }
            })

            await tx.perbaikanHistory.create({
              data: {
                perbaikanId: ex.perbaikanId,
                desc: "Perbaikan eksternal tidak selesai"
              }
            })
          }
        })
        return {
          ok: true,
          message: 'Berhasil menerima barang dari vendor'
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })

      }
    }),
  sendToUser: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const ex = await tx.perbaikanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.PERBAIKAN_EKSTERNAL_DISERAHKAN_KE_USER.id
            }
          })

          await tx.perbaikanExternalHistory.create({
            data: {
              desc: "Barang di kirim ke pemohon",
              perbaikanExternalId: id
            }
          })

          await tx.perbaikan.update({
            where: {
              id: ex.perbaikanId
            },
            data: {
              status: STATUS.PERBAIKAN_EKSTERNAL_SELESAI.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: ex.perbaikanId,
              desc: "Perbaikan eksternal telah selesai"
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasi mengirim ke user'
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })
      }
    }),
  userTerima: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const ex = await tx.perbaikanExternal.update({
            where: {
              id
            },
            data: {
              status: STATUS.SELESAI.id
            }
          })

          await tx.perbaikanExternalHistory.create({
            data: {
              desc: "Barang telah di terima oleh user",
              perbaikanExternalId: id
            }
          })

          await tx.perbaikan.update({
            where: {
              id: ex.perbaikanId
            },
            data: {
              status: STATUS.SELESAI.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              desc: "Perbaikan eksternal selesai",
              perbaikanId: ex.perbaikanId
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasi menerima barang'
        }

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Terjadi kesalahan pada server"
        })
      }
    }),
})