import { Game } from "@server/model/game";
import { games, logger, socketToGame } from "@server/types/constant";
import { ClientToServerEvents } from "@server/types/socket/client_to_server_events";
import { ServerToClientEvents } from "@server/types/socket/server_to_client_events";
import { DefaultEventsMap, Server, Socket } from "socket.io";

function userJoin(
  io: Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>,
  socket: Socket
): (roomID: number, playerName: string) => void {
  return (roomID: number, playerName: string) => {
    const roomIDString: string = String(roomID);

    // make sure players are restricted at 2
    if (io.sockets.adapter.rooms.get(roomIDString)?.size === 2) {
      socket.emit("game:error", "Game already reached two players!");
      return;
    }

    let gameID = Number(roomIDString);
    // Retrieve the game state or initialize it if it doesn't exist
    let game = games.get(gameID);

    if (!game) {
      socket.emit(
        "game:error",
        "Game does not exist, create a game room instead"
      );
      return;
    }

    // Set up the player socketID properly
    game.playerJoin(playerName, socket.id);

    logger.info(`Player Joined;Room ID: ${roomIDString}`);
    for (const player of game.players) {
      logger.info(`Player Joined;Player ID: ${player.socketId}`);
    }

    socket.join(roomIDString);
    socket.emit("user:joined", roomIDString);
  };
}

function userJoinAny(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    any
  >
): (playerName: string) => void {
  return (playerName: string) => {
    let game;
    for (let [_, g] of games) {
      if (g.numberOfPlayers < 2 && !g.privateRoom) {
        game = g;
      }
    }

    if (game == undefined) {
      socket.emit("game:error", "No active games!");
      return;
    } else {
      game.playerJoin(playerName, socket.id);

      logger.info(`Player Joined;Room ID: ${game.gameID}`);
      for (const player of game.players) {
        logger.info(`Player Joined;Player ID: ${player.socketId}`);
      }
      socket.join(String(game.gameID));
      socket.emit("user:joined", String(game.gameID));
    }
  };
}

function userReady(
  io: Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>,
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    any
  >
): (gameId: number) => void {
  return (gameID: number) => {
    // Wait for 2 players to start the game
    const room = io.sockets.adapter.rooms.get(String(gameID));

    let game = games.get(gameID);

    // Ensure the game object is correctly associated with the socket
    socketToGame.set(socket.id, game!);

    logger.info(`Player ready for: ${gameID}, room size: ${room?.size}`);
    if (room?.size === 2) {
      logger.info(`Game start for ${gameID}`);
      io.sockets.in(String(gameID)).emit("game:start");
    }
  };
}

function userCreate(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    any
  >
): (playerName: string, isPrivateRoom: boolean) => void {
  return (playerName: string, isPrivateRoom: boolean) => {
    console.log(playerName, isPrivateRoom)
    // generate a random game room ID and send back to the user
    // and player can wait for another user to join
    const roomIDString: string = String(
      Math.floor(Date.now() * Math.random())
    ).slice(0, 5);
    const gameID: number = Number(roomIDString);
    let game = games.get(gameID);

    if (!game) {
      game = new Game(gameID);
      game.privateRoom = isPrivateRoom; // determines if this game can be joined by anyone or only people with code
      games.set(gameID, game); // Save the game immediately after initialization
    }

    // Set up the player socketID properly
    game.playerJoin(playerName, socket.id);

    logger.info(`Game Create;Room ID: ${roomIDString}`);
    for (const player of game.players) {
      logger.info(`Game Created;Player ID: ${player.socketId}`);
    }
    socket.join(roomIDString);
    socket.emit("user:joined", roomIDString);
  };
}

export function disconnect(
  io: Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, any>,
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    any
  >
): () => void {
  return () => {
    logger.info(`User ${socket.id} left`);

    const game = socketToGame.get(socket.id);
    if (!game) {
      logger.error("Did not find existing game when user exited");
      return;
    }

    for (const player of game.players) {
      socketToGame.delete(player.socketId!);
    }

    games.delete(game.gameID);
    io.in(String(game.gameID)).socketsLeave(String(game.gameID));

    for (const player of game.players) {
      io.to(player.socketId!).emit("game:disconnect", "An user have left");
    }
    logger.info(`Game ${game.gameID} deleted`);
  };
}

export default function userEvents(io: Server, socket: Socket) {
  const socketsEvents: Record<string, (...args: any[]) => void> = {
    "user:join": userJoin(io, socket),
    "user:join_any": userJoinAny(socket),
    "user:ready": userReady(io, socket),
    "user:create": userCreate(socket),
    disconnect: disconnect(io, socket),
  };

  for (const event in socketsEvents) {
    socket.on(event, socketsEvents[event]);
  }
}
