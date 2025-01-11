import { Queue } from "quirrel/next-app"
import { getPusherInstance } from "@/lib/pusher/server";
const pusherServer = getPusherInstance();

// test
export const notificationQueue = Queue(
  "api/queue/notification", // 👈 the route it's reachable on
  async (data: {
    notifications: any[],
    from: any,
  }) => {
    const {  notifications, from } = data
    notifications.map(notification =>
      pusherServer.trigger(
        notification.toId,
        "notification",
        {
          id: notification.id,
          fromId: from.id,
          toId: notification.toId,
          link: notification.link,
          desc: notification.desc,
          isRead: false,
          createdAt: notification.createdAt,
          From: {
            image: from.image,
            name: from.name
          },
        }
      )
    )
  }
)

export const POST = notificationQueue