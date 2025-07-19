import { Server, Socket as ServerSocket } from "socket.io";
import { io as ioc, Socket as ClientSocket} from "socket.io-client";

export default function waitFor<T>(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise<T>((resolve) => {
    socket.once(event, resolve);
  });
}