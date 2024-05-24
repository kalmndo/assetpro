import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { STATUS, getStatus } from "@/lib/status";
import { ROLE } from "@/lib/role";

export const permintaanBarangRouter = createTRPCRouter({
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
            pemohondId: ctx.session.user.id
          },
          orderBy: {
            createdAt: "desc" as any
          },
          include: {
            Ruang: true,
            PermintaanBarangBarang: true
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
            // @ts-ignore
            Pemohon: true,
            Ruang: true,
            PermintaanBarangBarang: true
          }
        }
      }

      // @ts-ignore
      const result = await ctx.db.permintaanBarang.findMany(findMany)

      return result.map((v) => ({
        ...v,
        // @ts-ignore
        ruang: v.Ruang.name,
        // @ts-ignore
        jumlah: v.PermintaanBarangBarang.length,
        tanggal: v.createdAt.toLocaleDateString()
      }))
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          UserRole: true
        }
      })
      const roles = user?.UserRole.map((v) => v.roleId)

      const { id } = input
      const result = await ctx.db.permintaanBarang.findFirst({
        where: {
          id
        },
        include: {
          Ruang: true,
          Pemohon: {
            include: {
              Department: true,
              DepartmentUnit: true
            }
          },
          PermintaanBarangBarang: {
            include: {
              Uom: true,
              Barang: true,
              PermintaanBarangBarangKodeAnggaran: true
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something wrong",
        });
      }

      const {
        no,
        perihal,
        Ruang: { name: ruang },
        createdAt,
        status,
        Pemohon: {
          name,
          image,
          title,
          atasanId,
          Department: {
            name: department,
          },
          DepartmentUnit
        },
        PermintaanBarangBarang
      } = result



      const barang = PermintaanBarangBarang.filter((v) => v.status !== STATUS.IM_REJECT.id).map((v) => ({
        id: v.id,
        name: v.Barang.name,
        image: v.Barang.image ?? '',
        kode: v.Barang.fullCode,
        jumlah: String(v.qty),
        uom: {
          id: v.Uom.id,
          name: v.Uom.name
        },
        kodeAnggaran: v.PermintaanBarangBarangKodeAnggaran.map((v) => v.kodeAnggaranId),
        status: v.status
      }))

      const isAtasan = userId === atasanId && status === getStatus(STATUS.PENGAJUAN.id).id
      const isImApprove = roles?.includes(ROLE.IM_APPROVE.id) && status === getStatus(STATUS.ATASAN_SETUJU.id).id

      const canUpdate = isAtasan || isImApprove

      return {
        id,
        no,
        tanggal: createdAt.toLocaleDateString('id-ID'),
        perihal,
        ruang,
        status,
        pemohon: {
          name,
          image: image ?? '',
          title,
          department,
          departmentUnit: DepartmentUnit?.name
        },
        barang,
        canUpdate,
        isImApprove
      }
    }),
  create: protectedProcedure
    .input(z.object({
      no: z.string(),
      perihal: z.string(),
      ruangId: z.string(),
      barang: z.array(z.object({
        id: z.string(),
        qty: z.string(),
        uomId: z.string(),
        kodeAnggaran: z.array(z.string()),
        golongan: z.number()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        no,
        perihal,
        ruangId,
        barang
      } = input
      const pemohondId = ctx.session.user.id

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const userId = ctx.session.user.id

          const user = await tx.user.findFirst({
            where: {
              id: userId
            },
          })

          const atasanId = user?.atasanId

          const pb = await tx.permintaanBarang.create({
            data: {
              no,
              perihal,
              ruangId,
              status: STATUS.PENGAJUAN.id,
              pemohondId
            }
          })

          for (const b of barang) {
            const {
              id,
              qty,
              uomId,
              kodeAnggaran,
              golongan
            } = b

            const pbbId = await tx.permintaanBarangBarang.create({
              data: {
                barangId: id,
                status: STATUS.PENGAJUAN.id,
                permintaanId: pb.id,
                qty: Number(qty),
                qtyOrdered: 0,
                qtyOut: 0,
                uomId
              },
            })

            await tx.permintaanBarangBarangGroup.upsert({
              where: {
                barangId: id
              },
              create: {
                barangId: id,
                qty: Number(qty),
                permintaanBarang: [pbbId.id],
                golongan
              },
              update: {
                qty: { increment: Number(qty) },
                permintaanBarang: { push: pbbId.id }
              }
            })

            await tx.permintaanBarangBarangKodeAnggaran.createMany({
              data: kodeAnggaran.map((v) => {
                return {
                  kodeAnggaranId: v,
                  pbbId: pbbId.id
                }
              })
            })
          }
          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan internal memo ${pb.no}</span></p>`
          await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: atasanId ?? userId,
              link: `/permintaan/barang/${pb.id}`,
              desc,
              isRead: false,
            }
          })
          return {
            id: pb.id
          }
        })

        return {
          ok: true,
          data: { id: result.id },
          message: "Berhasil membuat permintaan barang"
        }
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "No Internal Memo ini sudah terdaftar, harap ubah.",
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
  approve: protectedProcedure
    .input(z.object({
      id: z.string(),
      update: z.array(z.object({
        id: z.string(),
        qty: z.string(),
        uomId: z.string(),
        catatan: z.string()
      })).nullable(),
      reject: z.array(z.object({
        id: z.string(),
        catatan: z.string()
      })).nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        update,
        reject
      } = input

      const userId = ctx.session.user.id
      const user = await ctx.db.user.findUnique({
        where: {
          id: userId
        },
        include: {
          UserRole: true
        }
      })

      const res = await ctx.db.permintaanBarang.findUnique({
        where: {
          id
        },
        include: {
          Pemohon: true
        }
      })

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permintaan Barang ini tidak ada",
        });
      }

      const isAtasan = res.Pemohon.atasanId === userId && res.status === getStatus(STATUS.PENGAJUAN.id).id
      const canEdit = user?.UserRole.some((v) => v.roleId === ROLE.IM_APPROVE.id) && res.status === getStatus(STATUS.ATASAN_SETUJU.id).id

      const status = isAtasan ? STATUS.ATASAN_SETUJU.id : STATUS.IM_APPROVE.id

      if (!isAtasan && !canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak punya hak untuk melakukan ini",
        });
      }

      try {
        await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.update({
            where: { id },
            data: {
              status: status
            },
            include: {
              PermintaanBarangBarang: true
            }
          })
          const updateRejectBarangs = [...(update ?? []), ...(reject ?? [])].map((v) => v.id)
          const untouchedBarangs = pb.PermintaanBarangBarang.filter((v) => !updateRejectBarangs.includes(v.id) && v.status !== STATUS.IM_REJECT.id)
          // <p class="text-sm font-semibold">Adam Kalalmondo<span class="font-normal ml-2">meminta persetujuan internal memo</span></p>
          const notifDesc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Menyetujui ${res.no}</span></p>`

          if (untouchedBarangs.length > 0) {
            for (const iterator of untouchedBarangs) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status: STATUS.IM_APPROVE.id,
                }
              })
              await tx.permintaanBarangBarangHistory.createMany({
                data: untouchedBarangs.map((v) => ({
                  pbbId: v.id,
                  desc: "Setuju",
                  status: STATUS.IM_APPROVE.id
                }))
              })
            }
          }

          if (update) {
            for (const iterator of update) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status: STATUS.IM_APPROVE.id,
                  qty: Number(iterator.qty),
                  uomId: iterator.uomId
                }
              })
            }
            await tx.permintaanBarangBarangHistory.createMany({
              data: update.map((v) => ({
                pbbId: v.id,
                // TODO: TO STRING REACT ELEMENT
                desc: "Menyetujui dan melakukan perubahan barang",
                status: STATUS.IM_APPROVE.id
              }))
            })
          }

          if (reject) {
            for (const iterator of reject) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status: STATUS.IM_REJECT.id
                }
              })
            }

            await tx.permintaanBarangBarangHistory.createMany({
              data: reject.map((v) => ({
                pbbId: v.id,
                desc: v.catatan,
                status: STATUS.IM_REJECT.id
              }))
            })
          }

          await tx.notification.create({
            data: {
              fromId: userId,
              toId: res.pemohondId,
              link: `/permintaan/barang/${pb.id}`,
              desc: notifDesc,
              isRead: false,
            }
          })
        })
        return {
          ok: true,
          message: "Berhasil menyetujui permintaan barang"
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
    }))
    .mutation(async ({ ctx, input }) => {
      const {
        id,
      } = input

      const userId = ctx.session.user.id
      const user = await ctx.db.user.findUnique({
        where: {
          id: userId
        },
        include: {
          UserRole: true
        }
      })

      const res = await ctx.db.permintaanBarang.findUnique({
        where: {
          id
        },
        include: {
          Pemohon: true
        }
      })

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Permintaan Barang ini tidak ada",
        });
      }

      const isAtasan = res.Pemohon.atasanId === userId && res.status === getStatus(STATUS.PENGAJUAN.id).id
      const canEdit = user?.UserRole.some((v) => v.roleId === ROLE.IM_APPROVE.id) && res.status === getStatus(STATUS.ATASAN_SETUJU.id).id

      const status = isAtasan ? STATUS.IM_REJECT.id : STATUS.IM_REJECT.id

      if (!isAtasan && !canEdit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kamu tidak punya hak untuk melakukan ini",
        });
      }

      try {
        await ctx.db.$transaction(async (tx) => {
          const pb = await tx.permintaanBarang.update({
            where: { id },
            data: {
              status: status
            },
            include: {
              PermintaanBarangBarang: true
            }
          })
          const untouchedBarangs = pb.PermintaanBarangBarang.filter((v) => v.status !== STATUS.IM_REJECT.id)
          const notifDesc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Menolak permintaan ${res.no}</span></p>`

          if (untouchedBarangs.length > 0) {
            for (const iterator of untouchedBarangs) {
              await tx.permintaanBarangBarang.update({
                where: {
                  id: iterator.id
                },
                data: {
                  status: 'to-reject',
                }
              })
              await tx.permintaanBarangBarangHistory.createMany({
                data: untouchedBarangs.map((v) => ({
                  pbbId: v.id,
                  desc: "Tolak",
                  status: 'to-reject'
                }))
              })
            }
          }

          await tx.notification.create({
            data: {
              fromId: userId,
              toId: res.pemohondId,
              link: `/permintaan/barang/${pb.id}`,
              desc: notifDesc,
              isRead: false,
            }
          })
        })
        return {
          ok: true,
          message: "Berhasil menolak permintaan barang"
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  checkKetersediaanByBarang: protectedProcedure
    .query(async ({ ctx }) => {

      const pbbg = await ctx.db.permintaanBarangBarangGroup.findMany()

      if (!pbbg) {
        return {
          tersedia: [],
          takTersedia: []
        };
      }

      const filterGolongan = (golongan: number) => pbbg.filter((v) => v.golongan === golongan);
      const [as, per] = [filterGolongan(1), filterGolongan(2)];
      const barangIds = pbbg.map((v) => v.barangId);

      const fetchBarangData = async (model: 'daftarAsetGroup' | 'kartuStok', ids: string[]) => {
        // @ts-ignore
        const result = await ctx.db[model].findMany({
          where: { id: { in: ids } },
          include: { MasterBarang: true }
        })
        return result
      }

      const [aset, persediaan] = await Promise.all([
        fetchBarangData('daftarAsetGroup', barangIds),
        fetchBarangData('kartuStok', barangIds)
      ]);

      const mapBarang = (barang: any, golonganData: any, qtyField: string) => {
        return barang.map((v: any) => {
          const permintaan = golonganData.find((a: any) => a.barangId === v.id);

          return {
            image: v.MasterBarang.image,
            name: v.MasterBarang.name,
            kode: v.MasterBarang.fullCode,
            permintaan: permintaan.qty,
            tersedia: v[qtyField],
            golongan: permintaan.golongan === 1 ? "Aset" : "Persediaan"
          };
        });
      }

      const mapBarangTersedia = (barang: any, golonganData: any, qtyField: string) => {
        return mapBarang(barang, golonganData, qtyField).filter((a: any) => a.tersedia > 0)
      }

      const mapBarangTakTersedia = (barang: any, golonganData: any, qtyField: string) => {
        return mapBarang(barang, golonganData, qtyField).map((v: any) => ({
          ...v,
          permintaan: v.permintaan - v.tersedia
        })).filter((a: any) => a.permintaan > 0)

      }

      const asetTersedia = mapBarangTersedia(aset, as, 'idle');
      const persediaanTersedia = mapBarangTersedia(persediaan, per, 'qty');
      const asetTakTersedia = mapBarangTakTersedia(aset, as, 'idle');
      const persediaanTakTersedia = mapBarangTakTersedia(persediaan, per, 'qty');


      const tersedia = [...asetTersedia, ...persediaanTersedia];
      const takTersedia = [...asetTakTersedia, ...persediaanTakTersedia];

      return {
        tersedia,
        takTersedia
      }
    })
});
