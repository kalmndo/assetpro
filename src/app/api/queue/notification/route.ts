import { Queue } from "quirrel/next-app"
import { getPusherInstance } from "@/lib/pusher/server";
import notifDesc from "@/lib/notifDesc";
const pusherServer = getPusherInstance();

// test
export const notificationQueue = Queue(
  "api/queues/email", // 👈 the route it's reachable on
  async (data: {
    form: any,
    notifications: any[],
    from: any
  }) => {
    const { form, notifications, from } = data
    await Promise.all(
      notifications.map(notification =>
        pusherServer.trigger(
          notification.toId,
          "notification",
          {
            id: notification.id,
            fromId: from.id,
            toId: notification.toId,
            link: `/pengadaan/permintaan-pembelian/${form.id}`,
            desc: notifDesc(from.name, "Permintaan pembelian barang", form.no),
            isRead: false,
            createdAt: notification.createdAt,
            From: {
              image: from.image,
              name: from.name
            },
          }
        )
      )
    );
  }
)

export const POST = notificationQueue