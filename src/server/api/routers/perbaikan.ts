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
            include: { Barang: { include: { Barang: true, Permintaan: true } } }
          },
          PerbaikanHistory: true
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
      const isUserCanAccept = userId === result.userId && result.status === STATUS.TEKNISI_DONE.id
      const isTeknisiCanDoneFromEks = userId === result.teknisiId && result.status === STATUS.PERBAIKAN_EKSTERNAL_SELESAI.id

      const p = result.User
      const b = result.Aset.MasterBarang

      const comps = result.PerbaikanKomponen.map((v) => {
        if (v.type === 0) {
          return {
            id: v.id,
            type: v.type,
            name: v.Barang?.Barang.name,
            code: v.Barang?.Barang.fullCode,
            // noInv: v.Barang?.Barang.
            noIm: v.Barang?.Permintaan.no,
            imId: v.Barang?.Permintaan.id,
            jumlah: v.jumlah,
            biaya: `Rp ${v.biaya.toLocaleString("id-ID")}`,
            b: v.biaya
          }
        }
        return {
          id: v.id,
          type: v.type,
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
        catatanTeknisi: result.catatanTeknisi,
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
        isUserCanAccept,
        isTeknisiCanDoneFromEks,
        components: comps.length === 0 ? [] : [...comps, { id: "total", type: "", biaya: `Rp ${totalComps.toLocaleString("id-ID")}`, jumlah: '', name: "" }],
        riwayat: result.PerbaikanHistory
      }
    }),
  getImConponents: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const relatedBarangIds = await ctx.db.perbaikanKomponen.findMany({
        where: {
          barangId: {
            not: null
          }
        },
        select: {
          barangId: true
        }
      });

      const relatedIds = relatedBarangIds.map(item => item.barangId!);

      const result = await ctx.db.imPerbaikan.findMany({
        where: {
          perbaikanId: id
        },
        include: {
          IM: {
            include: {
              PermintaanBarangBarang: {
                where: {
                  id: {
                    notIn: relatedIds
                  },
                  status: STATUS.SELESAI.id,
                },
                include: {
                  PerbaikanKomponen: true,
                  Barang: {
                    include: { Uom: true }
                  }
                }
              }
            }
          }
        }
      })

      return result.map((v) => ({
        id: v.id,
        imId: v.imId,
        no: v.IM.no,
        barang: v.IM.PermintaanBarangBarang.map((v) => ({
          id: v.id,
          barangId: v.barangId,
          image: v.Barang.image,
          name: v.Barang.name,
          code: v.Barang.fullCode,
          qty: v.qty,
          uom: v.Barang.Uom.name
        }))
      }))
    }),
  addComponent: protectedProcedure
    .input(z.object({
      perbaikanId: z.string(),
      type: z.string(),
      name: z.string(),
      items: z.array(z.string()),
      biaya: z.string(),
      jumlah: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        perbaikanId,
        type,
        name,
        items,
        biaya,
        jumlah
      } = input
      try {
        await ctx.db.$transaction(async (tx) => {

          if (type === '0') {
            const barang = await tx.permintaanBarangBarang.findMany({
              where: {
                id: {
                  in: items
                }
              },
              include: {
                PermintaanBarangBarangSplit: { include: { PBSPBB: { include: { PembelianBarang: { include: { PenawaranHargaBarangVendor: { select: { totalHarga: true } } } } } } } },
                Barang: true
              }
            })

            const newBarang = barang.map((v) => {
              const biaya = v.PermintaanBarangBarangSplit.flatMap((v) => v.PBSPBB.flatMap((v) => v.PembelianBarang.PenawaranHargaBarangVendor.flatMap((v) => v.totalHarga!))).reduce((a, b) => a + b, 0)

              return {
                perbaikanId,
                barangId: v.id,
                type: Number(type),
                biaya,
                jumlah: Number(v.qty)
              }
            })

            await tx.perbaikanKomponen.createMany({
              data: newBarang
            })
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

      return result.map((v) => ({
        id: v.id,
        no: v.no,
        barang: v.Aset.MasterBarang.name,
        keluhan: v.keluhan,
        tanggal: v.createdAt.toLocaleDateString(),
        status: v.status
      }))
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
          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: perbaikan.id,
              desc: 'Meminta permohonan perbaikan'
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
  teknisiDone: protectedProcedure
    .input(z.object({
      id: z.string(),
      catatan: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, catatan } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              catatanTeknisi: catatan,
              status: STATUS.TEKNISI_DONE.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Teknisi selesai memperbaiki dan mengirim barang ke user`,
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menyelesaikan perbaikan'
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),

  // EKSTERNAL
  teknisiUndoneExternal: protectedProcedure
    .input(z.object({
      id: z.string(),
      vendorId: z.string(),
      catatan: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, catatan, vendorId } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              catatanTeknisi: catatan,
              status: STATUS.TEKNISI_UNDONE_EXTERNAL.id
            }
          })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Barang dikirim ke eksternal untuk perbaikan lebih lanjut`,
            }
          })

          const per = await tx.perbaikanExternal.create({
            data: {
              status: STATUS.PENGAJUAN.id,
              no: Math.random().toString(),
              perbaikanId: id,
              vendorId
            }
          })

          await tx.perbaikanExternalHistory.create({
            data: {
              perbaikanExternalId: per.id,
              desc: `Permohonan perbaikan eksternal`
            }
          })
        })

        return {
          ok: true,
          message: 'Berhasil '
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  userTerima: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      try {
        await ctx.db.$transaction(async (tx) => {
          const res = await tx.perbaikan.update({
            where: {
              id
            },
            data: {
              status: STATUS.SELESAI.id
            },
            include: {
              Aset: true
            }
          })


          // TODO: Update status jadi used
          // await tx.daftarAset.update({
          //   where: {
          //     id: res.Aset.id
          //   },
          // })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: "Telah di terima oleh user"
            }
          })
        })
        return {
          ok: true,
          message: 'Berhasil menyelesaikan perbaikan'
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
