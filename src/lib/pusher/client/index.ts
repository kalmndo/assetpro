
import PusherClient from "pusher-js";

export const pusherClient = new PusherClient("98d9efbe7b1f0651f41b", {
  cluster: "ap1",
  // authEndpoint: "/api/pusher/auth",
});