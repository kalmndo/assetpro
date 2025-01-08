import PusherServer from 'pusher';

let pusherInstance: PusherServer | null = null;

export const getPusherInstance = () => {
  if (!pusherInstance) {
    pusherInstance = new PusherServer({
      appId: "1922561",
      key: "98d9efbe7b1f0651f41b",
      secret: "36f73d72807e5239c932",
      cluster: "ap1",
      useTLS: true,
    });
  }
  return pusherInstance;
};