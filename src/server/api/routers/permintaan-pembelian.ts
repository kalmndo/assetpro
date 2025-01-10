
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
} from "@/server/api/trpc";
import checkKetersediaanByBarang from "../shared/check-ketersediaan-by-barang";
import { STATUS } from "@/lib/status";
import { TRPCError } from "@trpc/server";
import { ROLE } from "@/lib/role";
import PENOMORAN from "@/lib/penomoran";
import getPenomoran from "@/lib/getPenomoran";
import notifDesc from "@/lib/notifDesc";
import { notificationQueue } from "@/app/api/queue/notification/route";

export const permintaanPembelianRouter = createTRPCRouter({
	getAll: protectedProcedure
		.query(async ({ ctx }) => {
			const result = await ctx.db.permintaanPembelian.findMany({
				orderBy: {
					createdAt: "desc"
				},
				include: {
					PermintaanPembelianBarang: true
				}
			})

			return result.map((v) => ({
				...v,
				jumlah: v.PermintaanPembelianBarang.length,
				tanggal: v.createdAt.toLocaleDateString()
			}))
		}),
	get: protectedProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input
			const userId = ctx.session.user.id

			const user = await ctx.db.user.findUnique({
				where: {
					id: userId
				},
				include: {
					UserRole: true
				}
			})
			if (!user) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tidak ada user ini",
				});
			}

			const roleIds = user.UserRole.map((v) => v.roleId)

			const result = await ctx.db.permintaanPembelian.findUnique({
				where: {
					id
				},
				include: {
					PBPP: { include: { Permintaan: true } },
					PermintaanPembelianBarang: {
						include: {
							MasterBarang: {
								include: {
									Uom: true
								}
							},
							PBSPBB: true
						}
					}
				}
			})

			if (!result) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Tidak ada form ini",
				});
			}

			const isApprove = result.status === STATUS.PENGAJUAN.id && roleIds.some((v) => v === ROLE.PEMBELIAN_APPROVE.id)

			const isSelect = result.status === STATUS.IM_APPROVE.id && roleIds.some((v) => v === ROLE.PEMBELIAN_SELECT_VENDOR.id)

			const ims = result.PBPP.map((v) => ({
				id: v.permintaanId,
				no: v.Permintaan.no,
			}))

			const barang = result.PermintaanPembelianBarang.map((v) => ({
				id: v.id,
				image: v.MasterBarang.image,
				name: v.MasterBarang.name,
				kode: v.MasterBarang.fullCode,
				jumlah: v.qty,
				uom: v.MasterBarang.Uom.name
			}))

			return {
				...result,
				tanggal: result.createdAt.toLocaleDateString(),
				ims,
				barang,
				isApprove,
				isSelect
			}
		})
	,
	create: protectedProcedure
		.input(z.array(z.string()))
		.mutation(async ({ ctx, input }) => {
			const barangGroupResult = await ctx.db.permintaanBarangBarangGroup.findMany({
				where: {
					barangId: { in: input }
				}
			})
			const { takTersedia } = await checkKetersediaanByBarang(ctx.db, barangGroupResult)
			const barangs = takTersedia.flatMap((v) => v.permintaanBarang)
			const im = imToUpdateStatus(barangs)
			const user = await ctx.db.user.findFirst({
				where: {
					id: ctx.session.user.id
				}
			})
			const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PEMBELIAN_APPROVE.id } })
			const userIds = allRoles.map((v) => v.userId).filter((v) => v !== ctx.session.user.id)

			try {
				const data = await ctx.db.$transaction(async (tx) => {
					const penomoran = await tx.penomoran.upsert({
						where: { id: PENOMORAN.PERMINTAAN_PEMBELIAN, year: String(new Date().getFullYear()) },
						update: { number: { increment: 1 } },
						create: { id: PENOMORAN.PERMINTAAN_PEMBELIAN, code: 'FPPB', number: 0, year: String(new Date().getFullYear()) },
					});
					const permPem = await tx.permintaanPembelian.create({
						data: {
							no: getPenomoran(penomoran),
							status: STATUS.PENGAJUAN.id
						}
					})

					await tx.permintaanBarang.updateMany({
						where: { id: { in: im } },
						data: { status: STATUS.PROCESS.id },
					});

					await tx.pBPP.createMany({
						data: im.map((v) => ({ permintaanId: v, pembelianId: permPem.id }))
					})

					const permintaanPembelianBarangData = takTersedia.map(value => ({
						barangId: value.id,
						formId: permPem.id,
						qty: value.permintaan,
					}));
					const ppb = await tx.permintaanPembelianBarang.createManyAndReturn({
						data: permintaanPembelianBarangData,
					});

					const permintaanBarangUpdates = [];
					const permintaanBarangSplitData = [];

					for (const value of takTersedia) {
						for (const iterator of value.permintaanBarang) {
							const data = {
								qtyOrdered: iterator.beli,
								...(iterator.status === 'approve' && { status: STATUS.PROCESS.id }),
							};
							permintaanBarangUpdates.push({ id: iterator.id, data });

							permintaanBarangSplitData.push({
								pbbId: iterator.id,
								qty: iterator.beli,
								status: 'order',
								PermintaanBarangBarangSplitHistory: {
									create: {
										formNo: permPem.no,
										formType: 'permintaan-pembelian',
										desc: 'Permintaan pembelian',
									},
								},
							});
						}
					}

					await Promise.all(
						permintaanBarangUpdates.map(update =>
							tx.permintaanBarangBarang.update({
								where: { id: update.id },
								data: update.data,
							}),
						),
					);

					const spr = await tx.permintaanBarangBarangSplit.createManyAndReturn({
						data: permintaanBarangSplitData.map(split => ({
							pbbId: split.pbbId,
							qty: split.qty,
							status: split.status,
						})),
					});

					await tx.permintaanBarangBarangSplitHistory.createMany({
						data: spr.map(split => ({
							barangSplitId: split.id,
							formNo: permPem.no,
							formType: "permintaan-pembelian",
							desc: "Permintaan pembelian",
						})),
					})

					const pbspbbs = spr.flatMap(spr =>
						ppb.map(ppb => ({
							sprId: spr.id,
							ppbId: ppb.id
						}))
					)

					await tx.pBSPBB.createMany({
						data: pbspbbs.map((v) => ({
							barangSplitId: v.sprId,
							pembelianBarangId: v.ppbId
						}))
					})

					await Promise.all(
						takTersedia.map((v) => (

							tx.permintaanBarangBarangGroup.update({
								where: {
									barangId: v.id
								},
								data: {
									ordered: { increment: v.permintaan }
								}
							})
						))
					)


					const notifications = await tx.notification.createManyAndReturn({
						data: userIds.map((v) => ({
							fromId: ctx.session.user.id,
							toId: v,
							link: `/pengadaan/permintaan-pembelian/${permPem.id}`,
							desc: notifDesc(user!.name, "Permintaan pembelian barang", permPem.no),
							isRead: false,
						}))
					})

					return {
						permPem,
						notifications
					}

				},
					{
						maxWait: 10000, // default: 2000
						timeout: 20000, // default: 5000
					}
				)

				notificationQueue.enqueue({
					link: `/pengadaan/permintaan-pembelian/${data.permPem.id}`,
					desc: notifDesc(user!.name, "Permintaan pembelian barang", data.permPem.no),
					notifications: data.notifications,
					from: user
				})

				return {
					ok: true,
					message: 'Berhasil membuat permintaan pembelian'
				}
			} catch (error) {
				console.log("error", error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Kemunkingan terjadi kesalahan sistem, silahkan coba lagi",
					cause: error,
				});
			}
		}),
	approve: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input
			const allRoles = await ctx.db.userRole.findMany({ where: { roleId: ROLE.PEMBELIAN_SELECT_VENDOR.id } })
			const userIds = allRoles.map((v) => v.userId).filter((v) => v !== ctx.session.user.id)
			const user = await ctx.db.user.findFirst({
				where: {
					id: ctx.session.user.id
				}
			})
			try {
				const data = await ctx.db.$transaction(async (tx) => {
					const permintaanPembelian = await tx.permintaanPembelian.update({
						where: {
							id
						},
						data: {
							status: STATUS.IM_APPROVE.id
						}
					})

					const result = await tx.permintaanPembelianBarang.findMany({
						where: {
							formId: id
						},
						include: {
							PBSPBB: {
								include: {

								}
							}
						}
					})

					const barangSplitIds = result.flatMap((v) => v.PBSPBB.flatMap((aa) => aa.barangSplitId))

					await tx.permintaanBarangBarangSplitHistory.createMany({
						data: barangSplitIds.map((value) => (
							{
								desc: 'Permintaan pembelian disetujui',
								formNo: permintaanPembelian.no,
								formType: 'permintaan-pembelian',
								barangSplitId: value
							}
						))
					})

					const penomoran = await tx.penomoran.upsert({
						where: { id: PENOMORAN.PERMINTAAN_PEMBELIAN, year: String(new Date().getFullYear()) },
						update: { number: { increment: 1 } },
						create: { id: PENOMORAN.PERMINTAAN_PEMBELIAN, code: 'FPPB', number: 0, year: String(new Date().getFullYear()) },
					});

					const permPem = await tx.permintaanPenawaran.create({
						data: {
							no: getPenomoran(penomoran),
							status: "pengajuan",
							pembelianId: id
						}
					})

					const notifications = await tx.notification.createManyAndReturn({
						data: userIds.map((v) => ({
							fromId: ctx.session.user.id,
							toId: v,
							link: `/pengadaan/permintaan-penawaran/${permPem.id}`,
							desc: notifDesc(user!.name, "Permintaan penawaran ke vendor", permPem.no),
							isRead: false,
						}
						))
					})

					return {
						notifications,
						permPem
					}
				})

				notificationQueue.enqueue({
					link: `/pengadaan/permintaan-penawaran/${data.permPem.id}`,
					desc: notifDesc(user!.name, "Permintaan penawaran ke vendor", data.permPem.no),
					notifications: data.notifications,
					from: user
				})

				return {
					ok: true,
					message: 'Berhasil menyetujui permintaan pembelian',
				}
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Terjadi kesalahan server",
					cause: error
				});
			}
		}),
});

function imToUpdateStatus(data: any): string[] {
	return [...new Set(data.filter((item: any) => item.imStatus === 'approve').map((item: any) => item.href))] as string[]
}