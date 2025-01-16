import getPenomoran from "@/lib/getPenomoran";
import notifDesc from "@/lib/notifDesc";
import PENOMORAN from "@/lib/penomoran";
import { getPusherInstance } from "@/lib/pusher/server";
import { ROLE } from "@/lib/role";
import { STATUS } from "@/lib/status";
import { SelectProps } from "@/lib/type";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
const pusherServer = getPusherInstance();

export const perbaikanRouter = createTRPCRouter({
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
          Teknisi: true,
        },
      });

      const result = await ctx.db.perbaikan.findFirst({
        where: {
          id,
        },
        include: {
          Aset: {
            include: { MasterBarang: true },
          },
          User: {
            include: { Department: true, DepartmentUnit: true },
          },
          Teknisi: {
            include: { User: true },
          },
          PerbaikanKomponen: {
            orderBy: { createdAt: "desc" },
            include: {
              Barang: { include: { Barang: true, Permintaan: true } },
            },
          },
          PerbaikanHistory: true,
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak ada form ini",
        });
      }

      const isCanSelectTeknisi =
        user?.UserRole.map((v) => v.roleId).some(
          (v) => v === ROLE.SELECT_TEKNISI.id,
        ) && result.status === STATUS.ATASAN_SETUJU.id;
      const isAtasanCanApprove =
        result.User.atasanId === userId &&
        result.status === STATUS.PENGAJUAN.id;
      const isTeknisiCanAccept =
        userId === result.teknisiId &&
        result.status === STATUS.TEKNISI_DISPOSITION.id;
      const isTeknisiCanDone =
        userId === result.teknisiId &&
        result.status === STATUS.TEKNISI_FIXING.id;
      const isUserCanAccept =
        userId === result.userId && result.status === STATUS.TEKNISI_DONE.id;
      const isTeknisiCanDoneFromEks =
        userId === result.teknisiId &&
        result.status === STATUS.PERBAIKAN_EKSTERNAL_SELESAI.id;

      const p = result.User;
      const b = result.Aset.MasterBarang;

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
            b: v.biaya,
          };
        }
        return {
          id: v.id,
          type: v.type,
          name: v.name,
          jumlah: v.jumlah,
          biaya: `Rp ${v.biaya.toLocaleString("id-ID")}`,
          b: v.biaya,
        };
      });

      const totalComps = comps.map((v) => v.b).reduce((a, b) => a + b, 0);

      let vendors: SelectProps[] = []

      if (isTeknisiCanDone) {
        const resv = await ctx.db.vendor.findMany()
        vendors = resv.map((v) => ({
          label: v.name,
          value: v.id
        }))
      }

      let teknisis: SelectProps[] = []

      if (isCanSelectTeknisi) {

        const rest = await ctx.db.teknisi.findMany({
          orderBy: {
            createdAt: "desc"
          },
          include: {
            User: true
          }
        })

        teknisis = rest.map((v) => ({
          label: v.User.name,
          value: v.id,
        }))
      }

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
          departmentUnit: p.DepartmentUnit?.name,
        },
        teknisi: result.Teknisi?.User.name,
        catatanTeknisi: result.catatanTeknisi,
        barang: {
          id: b.id,
          name: b.name,
          image: b.image,
          deskripsi: result.Aset.desc,
          noInv: result.Aset.id,
        },
        isAtasanCanApprove,
        isCanSelectTeknisi,
        isTeknisiCanAccept,
        isTeknisiCanDone,
        isUserCanAccept,
        isTeknisiCanDoneFromEks,
        components:
          comps.length === 0
            ? []
            : [
              ...comps,
              {
                id: "total",
                type: "",
                biaya: `Rp ${totalComps.toLocaleString("id-ID")}`,
                jumlah: "",
                name: "",
              },
            ],
        riwayat: result.PerbaikanHistory,
        vendors,
        teknisis
      };
    }),
  getImConponents: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const relatedBarangIds = await ctx.db.perbaikanKomponen.findMany({
        where: {
          barangId: {
            not: null,
          },
        },
        select: {
          barangId: true,
        },
      });

      const relatedIds = relatedBarangIds.map((item) => item.barangId!);

      const result = await ctx.db.imPerbaikan.findMany({
        where: {
          perbaikanId: id,
        },
        include: {
          IM: {
            include: {
              PermintaanBarangBarang: {
                where: {
                  id: {
                    notIn: relatedIds,
                  },
                  status: STATUS.SELESAI.id,
                },
                include: {
                  PerbaikanKomponen: true,
                  Barang: {
                    include: { Uom: true },
                  },
                },
              },
            },
          },
        },
      });

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
          uom: v.Barang.Uom.name,
        })),
      }));
    }),
  addComponent: protectedProcedure
    .input(
      z.object({
        perbaikanId: z.string(),
        type: z.string(),
        name: z.string(),
        items: z.array(z.string()),
        biaya: z.string(),
        jumlah: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { perbaikanId, type, name, items, biaya, jumlah } = input;
      try {
        await ctx.db.$transaction(async (tx) => {
          if (type === "0") {
            const barang = await tx.permintaanBarangBarang.findMany({
              where: {
                id: {
                  in: items,
                },
              },
              include: {
                PermintaanBarangBarangSplit: {
                  include: {
                    PBSPBB: {
                      include: {
                        PembelianBarang: {
                          include: {
                            PenawaranHargaBarangVendor: {
                              select: { totalHarga: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                Barang: true,
              },
            });

            const newBarang = barang.map((v) => {
              const biaya = v.PermintaanBarangBarangSplit.flatMap((v) =>
                v.PBSPBB.flatMap((v) =>
                  v.PembelianBarang.PenawaranHargaBarangVendor.flatMap(
                    (v) => v.totalHarga!,
                  ),
                ),
              ).reduce((a, b) => a + b, 0);

              return {
                perbaikanId,
                barangId: v.id,
                type: Number(type),
                biaya,
                jumlah: Number(v.qty),
              };
            });

            await tx.perbaikanKomponen.createMany({
              data: newBarang,
            });
          } else {
            await tx.perbaikanKomponen.create({
              data: {
                perbaikanId,
                type: Number(type),
                name,
                biaya: Number(biaya),
                jumlah: Number(jumlah),
              },
            });
          }
        });
        return {
          ok: true,
          message: "Berhasil menambah komponen perbaikan",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        isUser: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { isUser } = input;

      let findMany;

      if (isUser) {
        findMany = {
          where: {
            // @ts-ignore
            userId: ctx.session.user.id,
          },
          orderBy: {
            createdAt: "desc" as any,
          },
          include: {
            Aset: {
              include: {
                MasterBarang: true,
              },
            },
          },
        };
      } else {
        findMany = {
          where: {
            // @ts-ignore
            NOT: { status: STATUS.PENGAJUAN.id },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            Aset: {
              include: {
                MasterBarang: true,
              },
            },
          },
        };
      }

      // @ts-ignore
      const result = await ctx.db.perbaikan.findMany(findMany);

      return result.map((v) => ({
        id: v.id,
        no: v.no,
        barang: v.Aset.MasterBarang.name,
        keluhan: v.keluhan,
        tanggal: v.createdAt.toLocaleDateString(),
        status: v.status,
      }));
    }),
  create: protectedProcedure
    .input(
      z.object({
        asetId: z.string(),
        keluhan: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { asetId, keluhan } = input;
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findFirst({ where: { id: userId } })

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const user = await tx.user.findFirst({
            where: { id: userId },
          });

          const penomoran = await tx.penomoran.upsert({
            where: { id: PENOMORAN.IM, year: String(new Date().getFullYear()) },
            update: { number: { increment: 1 } },
            create: { id: PENOMORAN.IM, code: 'IM', number: 0, year: String(new Date().getFullYear()) },
          });


          const perbaikan = await tx.perbaikan.create({
            data: {
              no: getPenomoran(penomoran),
              userId,
              keluhan,
              asetId,
              status: STATUS.PENGAJUAN.id,
            },
          });

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: perbaikan.id,
              desc: "Meminta permohonan perbaikan",
            },
          });

          const desc = `<p class="text-sm font-semibold">${user?.name}<span class="font-normal ml-[5px]">Meminta persetujuan permintaan perbaikan ${perbaikan.no}</span></p>`;
          const notification = await tx.notification.create({
            data: {
              fromId: userId,
              // TODO: Benerin ini kalau gak ada atasan
              toId: user?.atasanId ?? userId,
              link: `/permintaan/perbaikan/${perbaikan.id}`,
              desc,
              isRead: false,
            },
          });
          return {
            notification
          }
        });

        await pusherServer.trigger(
          result.notification.toId,
          "notification",
          {
            id: result.notification.id,
            fromId: user?.id,
            toId: result.notification.toId,
            link: result.notification.link,
            desc: result.notification.desc,
            isRead: false,
            createdAt: result.notification.createdAt,
            From: {
              image: user?.image,
              name: user?.name
            },
          }
        )
        return {
          ok: true,
          message: "Berhasil meminta permohonan perbaikan",
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

      const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.SELECT_TEKNISI.id } })
      const userIds = allRoles.map((v) => v.userId)
      const user = await ctx.db.user.findFirst({ where: { id: ctx.session.user.id } })

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const res = await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              status: STATUS.ATASAN_SETUJU.id,
            },
          });
          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: "Atasan menyetujui permintaan perbaikan",
            },
          });

          const notifications = await tx.notification.createManyAndReturn({
            data: [...userIds, res.userId].map((v) => ({
              fromId: user!.id,
              toId: v,
              link: `/permintaan/perbaikan/${res.id}`,
              desc: notifDesc(user!.name, "Menyetujui", res.no),
              isRead: false,
            }))
          })
          return {
            notifications,
          }
        });


        const { notifications } = result
        await Promise.all(
          notifications.map((v) => (
            pusherServer.trigger(
              v.toId,
              "notification",
              {
                id: v.id,
                fromId: user?.id,
                toId: v.toId,
                link: v.link,
                desc: v.desc,
                isRead: false,
                createdAt: v.createdAt,
                From: {
                  image: user?.image,
                  name: user?.name
                },
              }
            )
          ))
        )

        return {
          ok: true,
          message: "Berhasil menyetujui permintaan perbaikan",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  selectTeknisi: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        teknisiId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, teknisiId } = input;

      const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PERBAIKAN_PERMINTAAN_VIEW.id } })
      const userIds = allRoles.map((v) => v.userId)
      const user = await ctx.db.user.findFirst({ where: { id: ctx.session.user.id } })

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const teknisi = await tx.teknisi.findFirst({
            where: { id: teknisiId },
            include: {
              User: true,
            },
          });

          const res = await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              teknisiId,
              status: STATUS.TEKNISI_DISPOSITION.id,
            },
          });

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: "Diserahkan ke teknisi",
              catatan: teknisi?.User.name,
            },
          });

          const notifications = await tx.notification.createManyAndReturn({
            data: [teknisiId, res.userId].map((v) => ({
              fromId: user!.id,
              toId: v,
              link: `/permintaan/perbaikan/${res.id}`,
              desc: notifDesc(user!.name, "Menyerahkan ke teknisi", res.no),
              isRead: false,
            }))
          })
          return {
            notifications,
          }
        });

        const { notifications } = result
        await Promise.all(
          notifications.map((v) => (
            pusherServer.trigger(
              v.toId,
              "notification",
              {
                id: v.id,
                fromId: user?.id,
                toId: v.toId,
                link: v.link,
                desc: v.desc,
                isRead: false,
                createdAt: v.createdAt,
                From: {
                  image: user?.image,
                  name: user?.name
                },
              }
            )
          ))
        )

        return {
          ok: true,
          message: "Berhasil menyerahkan ke teknisi",
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
          await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              status: STATUS.IM_REJECT.id,
            },
          });

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Atasan menolak permintaan perbaikan`,
              catatan,
            },
          });

        });
        return {
          ok: true,
          message: "Berhasil menolak permintaan perbaikan",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  teknisiTerima: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PERBAIKAN_PERMINTAAN_VIEW.id } })
      const userIds = allRoles.map((v) => v.userId)
      const user = await ctx.db.user.findFirst({ where: { id: ctx.session.user.id } })

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const res = await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              status: STATUS.TEKNISI_FIXING.id,
            },
          });

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Teknisi menenrima barang dan memperbaiki barang`,
            },
          });

          const notifications = await tx.notification.createManyAndReturn({
            data: [...userIds, res.userId].map((v) => ({
              fromId: user!.id,
              toId: v,
              link: `/permintaan/perbaikan/${res.id}`,
              desc: notifDesc(user!.name, "Sedang memperbaiki barang", res.no),
              isRead: false,
            }))
          })
          return {
            notifications,
          }
        });

        const { notifications } = result
        await Promise.all(
          notifications.map((v) => (
            pusherServer.trigger(
              v.toId,
              "notification",
              {
                id: v.id,
                fromId: user?.id,
                toId: v.toId,
                link: v.link,
                desc: v.desc,
                isRead: false,
                createdAt: v.createdAt,
                From: {
                  image: user?.image,
                  name: user?.name
                },
              }
            )
          ))
        )

        return {
          ok: true,
          message: "Berhasil menerima barang",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  teknisiDone: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        catatan: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, catatan } = input;

      const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PERBAIKAN_PERMINTAAN_VIEW.id } })
      const userIds = allRoles.map((v) => v.userId)
      const user = await ctx.db.user.findFirst({ where: { id: ctx.session.user.id } })

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const res = await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              catatanTeknisi: catatan,
              status: STATUS.TEKNISI_DONE.id,
            },
          });

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: `Teknisi selesai memperbaiki dan mengirim barang ke user`,
            },
          });
          const notifications = await tx.notification.createManyAndReturn({
            data: [...userIds, res.userId].map((v) => ({
              fromId: user!.id,
              toId: v,
              link: `/permintaan/perbaikan/${res.id}`,
              desc: notifDesc(user!.name, "Selesai memperbaiki dan mengirim barang ke user", res.no),
              isRead: false,
            }))
          })
          return {
            notifications,
          }
        });

        const { notifications } = result
        await Promise.all(
          notifications.map((v) => (
            pusherServer.trigger(
              v.toId,
              "notification",
              {
                id: v.id,
                fromId: user?.id,
                toId: v.toId,
                link: v.link,
                desc: v.desc,
                isRead: false,
                createdAt: v.createdAt,
                From: {
                  image: user?.image,
                  name: user?.name
                },
              }
            )
          ))
        )
        return {
          ok: true,
          message: "Berhasil menyelesaikan perbaikan",
        };
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
    .input(
      z.object({
        id: z.string(),
        vendorId: z.string(),
        catatan: z.string(),
        type: z.string(),
        asetId: z.string(),
        pemohonId: z.string()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, type, catatan, vendorId, asetId, pemohonId } = input;
      const isExternal = Number(type)

      const user = await ctx.db.user.findFirst({ where: { id: ctx.session.user.id } })

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          const res = await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              catatanTeknisi: catatan,
              status: isExternal ? STATUS.TEKNISI_UNDONE_EXTERNAL.id : STATUS.SELESAI.id,
            },
          });

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: isExternal ? `Barang dikirim ke eksternal untuk perbaikan lebih lanjut` : 'Barang tidak dapat di perbaiki',
            },
          });

          if (isExternal) {

            const penomoran = await tx.penomoran.upsert({
              where: { id: PENOMORAN.PERBAIKAN_EKSTERNAL, year: String(new Date().getFullYear()) },
              update: { number: { increment: 1 } },
              create: { id: PENOMORAN.PERBAIKAN_EKSTERNAL, code: 'FPPK', number: 0, year: String(new Date().getFullYear()) },
            });

            const per = await tx.perbaikanExternal.create({
              data: {
                status: STATUS.PENGAJUAN.id,
                no: getPenomoran(penomoran),
                perbaikanId: id,
                vendorId,
              },
            });

            await tx.perbaikanExternalHistory.create({
              data: {
                perbaikanExternalId: per.id,
                desc: `Permohonan perbaikan eksternal`,
              },
            });

            const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PERBAIKAN_EKSTERNAL_APPROVE.id } })
            const userIds = allRoles.map((v) => v.userId).filter((v) => v !== ctx.session.user.id)

            const notifications = await tx.notification.createManyAndReturn({
              data: [...userIds, pemohonId].map((v) => ({
                fromId: ctx.session.user.id,
                toId: v,
                link: `/perbaikan/eksternal/${per.id}`,
                desc: notifDesc(user!.name, "Permintaan perbaikan eksternal", per.no),
                isRead: false,
              }))
            })

            return {
              notifications
            }
          } else {
            const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PERBAIKAN_PERMINTAAN_VIEW.id } })
            const userIds = allRoles.map((v) => v.userId).filter((v) => v !== ctx.session.user.id)

            const notifications = await tx.notification.createManyAndReturn({
              data: [...userIds, pemohonId].map((v) => ({
                fromId: ctx.session.user.id,
                toId: v,
                link: `/perbaikan/permintaan/${res.id}`,
                desc: notifDesc(user!.name, "Barang tidak dapat di perbaiki", res.no),
                isRead: false,
              }))
            })
            await tx.daftarAset.update({
              where: {
                id: asetId
              },
              data: {
                status: STATUS.ASET_BROKE.id
              }
            })
            return {
              notifications
            }
          }
        });

        const { notifications } = result
        await Promise.all(
          notifications.map((v) => (
            pusherServer.trigger(
              v.toId,
              "notification",
              {
                id: v.id,
                fromId: user?.id,
                toId: v.toId,
                link: v.link,
                desc: v.desc,
                isRead: false,
                createdAt: v.createdAt,
                From: {
                  image: user?.image,
                  name: user?.name
                },
              }
            )
          ))
        )

        return {
          ok: true,
          message: "Berhasil ",
        };
      } catch (error) {
        console.log("error", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
          cause: error,
        });
      }
    }),
  userTerima: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      try {
        await ctx.db.$transaction(async (tx) => {
          const res = await tx.perbaikan.update({
            where: {
              id,
            },
            data: {
              status: STATUS.SELESAI.id,
            },
            include: {
              Aset: true,
            },
          });

          // TODO: Update status jadi used
          // await tx.daftarAset.update({
          //   where: {
          //     id: res.Aset.id
          //   },
          // })

          await tx.perbaikanHistory.create({
            data: {
              perbaikanId: id,
              desc: "Telah di terima oleh user",
            },
          });
        });
        return {
          ok: true,
          message: "Berhasil menyelesaikan perbaikan",
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
