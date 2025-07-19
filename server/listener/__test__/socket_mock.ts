import { Server, Socket as ServerSocket } from "socket.io";
import { io as ioc } from "socket.io-client";
import { createServer } from "http";

import gameEvents from "../game_events/game_update";
import userEvents from "../user_events/user_connection";
import config from "@server/config/config";
import waitFor from "./waitfor";

export default async function setupTestServer() {
  const httpServer = createServer();

  const io = new Server(httpServer);
  httpServer.listen(config.serverPort);

  const clientSocket1 = ioc(`ws://localhost:${config.serverPort}`, {
    transports: ["websocket"],
  });

  const clientSocket2 = ioc(`ws://localhost:${config.serverPort}`, {
    transports: ["websocket"],
  });

  const clientSocket3 = ioc(`ws://localhost:${config.serverPort}`, {
    transports: ["websocket"],
  });

  let serverSocket: ServerSocket | undefined = undefined;
  io.on("connection", (connectedSocket) => {
    serverSocket = connectedSocket;
    gameEvents(io, serverSocket);
    userEvents(io, serverSocket);
  });

  await waitFor(clientSocket1, "connect");

  return { io, clientSocket1, clientSocket2, clientSocket3, serverSocket };
}
