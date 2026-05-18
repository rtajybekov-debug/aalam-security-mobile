import { io, Socket } from "socket.io-client";
import { ENV } from "../config/env";

let socket: Socket | null = null;
let currentToken: string | null = null;

export const socketService = {
  connect(token: string) {
    if (socket) {
      if (currentToken !== token) {
        currentToken = token;
        socket.auth = { token };
        if (socket.connected) {
          socket.disconnect();
        }
        socket.connect();
      }
      return socket;
    }

    socket = io(`${ENV.wsUrl}/ws`, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      // 30s cap is friendlier on battery and infra than 10s under sustained outages.
      reconnectionDelayMax: 30000,
    });
    currentToken = token;
    return socket;
  },
  getSocket() {
    return socket;
  },
  disconnect() {
    socket?.disconnect();
    socket = null;
    currentToken = null;
  },
};
