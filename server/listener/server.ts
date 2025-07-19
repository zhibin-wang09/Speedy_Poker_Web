import { logger } from "@server/types/constant";
import { ClientToServerEvents } from "@server/types/socket/client_to_server_events";
import { ServerToClientEvents } from "@server/types/socket/server_to_client_events";
import { Server } from "socket.io";
import gameEvents from "./game_events/game_update";
import userEvents from "./user_events/user_connection";

export default (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket) => {
    logger.info(`user ${socket.id} joined`);
    gameEvents(io, socket);
    userEvents(io, socket);
  });
};
