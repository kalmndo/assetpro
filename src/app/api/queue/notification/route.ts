import { Queue } from "quirrel/next-app"
import { getPusherInstance } from "@/lib/pusher/server";
import notifDesc from "@/lib/notifDesc";
const pusherServer = getPusherInstance();

// test
export const notificationQueue = Queue(
  "api/queues/email", // 👈 the route it's reachable on
  async (data: {
    notifications: any[],
    from: any,
    link: string,
    desc: string
  }) => {
    const { link, desc, notifications, from } = data
    await Promise.all(
      notifications.map(notification =>
        pusherServer.trigger(
          notification.toId,
          "notification",
          {
            id: notification.id,
            fromId: from.id,
            toId: notification.toId,
            link,
            desc,
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