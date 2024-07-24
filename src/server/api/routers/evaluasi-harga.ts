import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { STATUS } from "@/lib/status";
import isTodayOrAfter from "@/lib/isTodayOrAfter";
import { type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";

export const evaluasiHargaRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.evaluasi.findMany({
        orderBy: {
          createdAt: "desc"
        },
        include: {
          PenawaranHarga: {
            include: {
              PermintaanPenawaran: {
                include: {
                  Pembelian: {
                    include: {
                      PermintaanPembelianBarang: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      return result?.map((v) => ({
        ...v,
        jumlah: v.PenawaranHarga.PermintaanPenawaran.Pembelian.PermintaanPembelianBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input
      const userId = ctx.session.user.id

      const result = await ctx.db.evaluasi.findFirst({
        where: {
          id
        },
        include: {
          PenawaranHarga: true,
          EvaluasiVendorTerpilihUser: {
            include: {
              EvaluasiVendorTerpilihVendor: true
            }
          },
          EvaluasiBarang: {
            include: {
              PenawaranHargaBarangVendor: {
                include: {
                  Vendor: {
                    include: {
                      Vendor: true
                    }
                  }
                }
              },
              PembelianBarang: {
                include: {
                  PermintaanPembelian: {
                    include: {
                      PermintaanPembelianBarang: {
                        include: {
                          PermintaanPenawaranBarangVendor: true
                        }
                      }
                    }
                  },
                  PenawaranHargaBarangVendor: {
                    include: {
                      Vendor: {
                        include: {
                          Vendor: true
                        }
                      }
                    }
                  },
                  MasterBarang: {
                    include: {
                      Uom: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada form ini",
        });
      }

      const usersSelectedVendor = result.EvaluasiVendorTerpilihUser

      const evaluasiUsers = await ctx.db.masterEvaluasiUser.findMany({
        include: {
          User: true
        }
      })

      const sortedEvaluasiUsers = evaluasiUsers.sort((a, b) => a.nilai - b.nilai)

      const canApprove = sortedEvaluasiUsers[usersSelectedVendor.length]?.User.id === userId && isTodayOrAfter(result.PenawaranHarga.deadline)

      let getVendors

      if (result.status === STATUS.MENUNGGU.id) {
        getVendors = await ctx.db.vendor.findMany()
      }

      const barang = result.EvaluasiBarang.map((v) => {

        return ({
          id: v.id,
          name: v.PembelianBarang!.MasterBarang.name,
          kode: v.PembelianBarang!.MasterBarang.fullCode,
          image: v.PembelianBarang!.MasterBarang.image ?? '',
          uom: v.PembelianBarang!.MasterBarang.Uom.name,
          qty: v.PembelianBarang!.qty,
          vendorTerpilihId: v.penawaranHargaBarangVendorId,
          vendorTerpilih: v.PenawaranHargaBarangVendor?.Vendor.Vendor.name,
          vendorTerpilihHarga: v.PenawaranHargaBarangVendor?.harga,
          vendorTerpilihTotal: v.PenawaranHargaBarangVendor?.totalHarga,
          vendor: v.PembelianBarang?.PenawaranHargaBarangVendor.map((a) => ({
            id: a.id,
            name: a.Vendor.Vendor.name,
            harga: a.harga,
            total: a.totalHarga,
            // catatan: v.PembelianBarang?.PermintaanPembelian.PermintaanPembelianBarang.find((v) => v.),
            // garansi: a.,
            // termin: a.
          })),
        })
      })

      return {
        id: result.id,
        no: result.no,
        penawaranHarga: {
          id: result.PenawaranHarga.id,
          no: result.PenawaranHarga.no
        },
        barang,
        status: result.status,
        tanggal: result.createdAt.toLocaleDateString(),
        getVendors: getVendors ?? [],
        canApprove,
        penawaranDeadline: result.PenawaranHarga.deadline?.toLocaleDateString(),
        // deadline: result.deadline?.toLocaleDateString()
      }
    }),
  checkEvaluasi: protectedProcedure
    .input(z.object({
      ids: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const { ids } = input
      const userId = ctx.session.user.id

      const result = await isCreatePo(ctx.db, ids, userId)

      return result
    }),
  send: protectedProcedure
    .input(z.object({
      id: z.string(),
      barangs: z.array(z.object({
        barangId: z.string(),
        vendorId: z.string()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        barangs
      } = input

      const userId = ctx.session.user.id

      const vendorIds = barangs.map((v) => v.vendorId)


      try {
        await ctx.db.$transaction(async (tx) => {
          const { isCreatePo: isPO, nextUser, currentUser } = await isCreatePo(ctx.db, vendorIds, userId)

          const evaluasi = await tx.evaluasi.findFirst({
            where: {
              id
            },
            include: {
              EvaluasiBarang: true
            }
          })

          const permintaanPembelianBarangIds = evaluasi?.EvaluasiBarang.map((v) => v.pembelianBarangId) as string[]

          const pBSPBB = await tx.pBSPBB.findMany({
            where: {
              pembelianBarangId: { in: permintaanPembelianBarangIds }
            }
          })
          const evaluasiUser = await tx.evaluasiVendorTerpilihUser.create({
            data: {
              evaluasiId: id,
              userId
            }
          })

          for (const { barangId, vendorId } of barangs) {
            await tx.evaluasiVendorTerpilihVendor.create({
              data: {
                barangId,
                vendorId,
                userId: evaluasiUser.id
              }
            })

            await tx.evaluasiBarang.update({
              where: {
                id: barangId,
              },
              data: {
                penawaranHargaBarangVendorId: vendorId
              }
            })
          }


          if (isPO) {
            // group kan dengan vendor yang sama
            const penawaranHargaBarangVendors = await tx.penawaranHargaBarangVendor.findMany({
              where: {
                id: { in: barangs.map((v) => v.vendorId) }
              },
              include: {
                Vendor: {
                  include: {
                    Vendor: true
                  }
                }
              }
            })

            const toBeGrouped = penawaranHargaBarangVendors.map((v) => ({
              vendorId: v.Vendor.Vendor.id,
              barangId: v.id,
              pembelianBarangId: v.pembelianBarangId
            }))

            const groupedData: any[] = Object.values(toBeGrouped.reduce((acc, { vendorId, barangId, pembelianBarangId }) => {
              // @ts-ignore
              if (!acc[vendorId]) {
                // @ts-ignore
                acc[vendorId] = { vendorId, barangs: [] };
              }
              // @ts-ignore
              acc[vendorId].barangs.push({ barangId, pembelianBarangId });
              return acc;
            }, {}));

            for (const value of groupedData) {
              const po = await tx.pO.create({
                data: {
                  evaluasiId: id,
                  no: Math.random().toString(),
                  status: STATUS.MENUNGGU.id,
                  vendorId: value.vendorId
                }
              })

              for (const val of value.barangs) {
                for (const { barangSplitId } of pBSPBB.filter((v) => v.pembelianBarangId === val.pembelianBarangId)) {
                  await tx.permintaanBarangBarangSplitHistory.create({
                    data: {
                      formType: "evaluasi",
                      barangSplitId,
                      formNo: po?.no,
                      desc: `Dievaluasi dan di buat PO oleh ${currentUser}`
                    }
                  })
                }
                await tx.poBarang.create({
                  data: {
                    poId: po.id,
                    status: 0,
                    barangId: val.barangId
                  }
                })
              }
            }

            await tx.evaluasi.update({
              where: {
                id
              },
              data: {
                status: STATUS.SELESAI.id
              }
            })

            return {
              ok: true,
              message: 'Berhasil membuat PO'
            }
          } else {

            for (const { barangSplitId } of pBSPBB) {
              await tx.permintaanBarangBarangSplitHistory.create({
                data: {
                  formType: "evaluasi",
                  barangSplitId,
                  formNo: evaluasi?.no,
                  desc: `Dievaluasi oleh ${currentUser} dan diteruskan ke ${nextUser}`
                }
              })
            }
            await tx.evaluasi.update({
              where: {
                id
              },
              data: {
                status: STATUS.PROCESS.id
              }
            })
          }
        })



        return {
          ok: true,
          message: 'Berhasil meneruskan evaluasi'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          // @ts-ignore
          message: error.message,
          cause: error
        });
      }

    })
})

async function isCreatePo(
  db: PrismaClient<{
    log: ("warn" | "error")[];
  }, never, DefaultArgs>,
  ids: string[],
  userId: string
) {
  const result = await db.penawaranHargaBarangVendor.findMany({
    where: {
      id: {
        in: ids
      }
    }
  })

  const totalHarga = result.map((v) => v.totalHarga).reduce((acc, curr) => acc! + curr!, 0)!

  const masterEvaluasiUser = await db.masterEvaluasiUser.findMany({
    orderBy: {
      nilai: 'asc'
    },
    include: {
      User: true
    }
  })

  const userIndex = masterEvaluasiUser.findIndex((v) => v.userId === userId)
  const lastEvaluasi = masterEvaluasiUser.length === userIndex + 1
  const exceeded = totalHarga <= masterEvaluasiUser[userIndex]!.nilai

  if (lastEvaluasi || exceeded) {
    const reason = lastEvaluasi ? 'Karena anda user evaluasi terakhir maka' : 'Nilai harga total dari vendor yang anda pilih lebih kecil dari nilai evaluasi mu, maka'

    return {
      isCreatePo: true,
      nilai: masterEvaluasiUser[userIndex]!.nilai,
      total: totalHarga,
      title: 'Apakah anda yakin?',
      message: `${reason} anda akan membuat PO dan mengirim PO kepada vendor, aksi ini tidak dapat dibatalkan.`,
      button: 'Yakin dan kirim PO',
      currentUser: masterEvaluasiUser[userIndex]?.User.name
    }
  } else {
    return {
      isCreatePo: false,
      nilai: masterEvaluasiUser[userIndex]!.nilai,
      total: totalHarga,
      title: 'Meneruskan Evaluasi',
      message: `Diteruskan kepada ${masterEvaluasiUser[userIndex + 1]?.User.name} karena total harga dari vendor yang anda pilih lebih besar dari nilai evaluasi mu`,
      button: 'Teruskan',
      currentUser: masterEvaluasiUser[userIndex]?.User.name,
      nextUser: masterEvaluasiUser[userIndex + 1]?.User.name
    }
  }
}