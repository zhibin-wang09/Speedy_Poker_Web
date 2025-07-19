import http from "http";
import { Server } from "socket.io";
import config from "@server/config/config";
import { ClientToServerEvents } from "@server/types/socket/client_to_server_events";
import { ServerToClientEvents } from "@server/types/socket/server_to_client_events";
import { logger } from "@server/types/constant";
import initIo from "@server/listener/server";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = http.createServer(handler);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);
  initIo(io);

  httpServer.listen(config.serverPort, () => {
    logger.info("Server started");
  });
});