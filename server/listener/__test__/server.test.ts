import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import setupTestServer from "@server/listener/__test__/socket_mock";
import { faker, fakerSR_RS_latin } from "@faker-js/faker";
import waitFor from "@server/listener/__test__/waitfor";
import { games, socketToGame } from "@server/types/constant";
import { response } from "express";
import { GameState } from "@server/types/response_types/updated_game_response";
import { PlayerId } from "@server/types/enums";

describe("Server behaviors", () => {
  let io: Server,
    serverSocket: ServerSocket | undefined,
    clientSocket1: ClientSocket,
    clientSocket2: ClientSocket,
    clientSocket3: ClientSocket;

  beforeEach(async () => {
    const response = await setupTestServer();
    io = response.io;
    clientSocket1 = response.clientSocket1;
    clientSocket2 = response.clientSocket2;
    clientSocket3 = response.clientSocket3;
    serverSocket = response.serverSocket;
    games.clear();
    socketToGame.clear();
  });

  afterEach(() => {
    io.close();
    clientSocket1.close();
    clientSocket2.close();
    clientSocket3.close();
  });

  it("User creates a game on success", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));

    const promises = [waitFor<string>(clientSocket1, "user:joined")];

    const [response] = await Promise.all(promises);

    expect(games.keys()).toContain(Number(response));
    expect(socketToGame.keys()).toContain(clientSocket1.id);
    expect(serverSocket?.rooms.values()).toContain(response);
  });

  it("Game should be initialized after two players join", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));

    let roomId = await waitFor<string>(clientSocket1, "user:joined");

    clientSocket2.emit("user:join", Number(roomId), faker.string.alpha(10));

    roomId = await waitFor<string>(clientSocket2, "user:joined");

    let game = games.get(Number(roomId));

    expect(game?.numberOfPlayers).toBe(2);
    expect(game?.centerDrawPile1.length).greaterThan(0); // indicates that deck has been initialized
  });

  it("game should not be initialized when there's less than two players", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));

    let roomId = await waitFor<string>(clientSocket1, "user:joined");

    let game = games.get(Number(roomId));

    expect(game?.numberOfPlayers).toBe(1);
    expect(game?.centerDrawPile1).toHaveLength(0); // indicates that deck is not initialized
  });

  it("User join any game should find any game with less than two players", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));

    let roomId = await waitFor<string>(clientSocket1, "user:joined");

    let game = games.get(Number(roomId));

    expect(game?.numberOfPlayers).toBe(1);

    clientSocket2.emit("user:join_any", faker.string.alpha(10));

    let roomId2 = await waitFor<string>(clientSocket2, "user:joined");

    expect(roomId).toEqual(roomId2);
    expect(game?.numberOfPlayers).toBe(2);
    expect(game?.centerDrawPile1).not.toHaveLength(0);
  });

  it("User can not join games with 2 players already", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));

    let roomId = await waitFor<string>(clientSocket1, "user:joined");

    let game = games.get(Number(roomId));

    expect(game?.numberOfPlayers).toBe(1);

    clientSocket2.emit("user:join_any", faker.string.alpha(10));

    let roomId2 = await waitFor<string>(clientSocket2, "user:joined");

    expect(roomId).toEqual(roomId2);
    expect(game?.numberOfPlayers).toBe(2);

    clientSocket3.emit("user:join", roomId, faker.string.alpha(10));

    let response = await waitFor<string>(clientSocket3, "game:error");
    expect(response).toBe("Game already reached two players!");
  });

  it("User can not join a game that has not been created yet", async () => {
    clientSocket1.emit(
      "user:join",
      faker.number.int(10),
      faker.string.alpha(10)
    );

    let response = await waitFor<string>(clientSocket1, "game:error");
    expect(response).toBe("Game does not exist, create a a game room instead");
  });

  it("Game starts after two players join in a game", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));
    clientSocket2.emit("user:join_any", faker.string.alpha(10));

    const promises = [
      waitFor<string>(clientSocket1, "user:joined"),
      waitFor<string>(clientSocket2, "user:joined"),
    ];

    const [response, response2] = await Promise.all(promises);

    clientSocket1.emit("user:ready", response);
    clientSocket2.emit("user:ready", response2);

    const userReadyPromises = [
      waitFor<string>(clientSocket1, "game:start"),
      waitFor<string>(clientSocket2, "game:start"),
    ];

    const [a] = await Promise.all(userReadyPromises);
  });

  it("Get game state on success", async () => {
    clientSocket1.emit("user:create", faker.string.alpha(10));
    clientSocket2.emit("user:join_any", faker.string.alpha(10));

    const promises = [
      waitFor<string>(clientSocket1, "user:joined"),
      waitFor<string>(clientSocket2, "user:joined"),
    ];

    const [response, response2] = await Promise.all(promises);

    clientSocket1.emit("user:ready", response);
    clientSocket2.emit("user:ready", response2);

    const userReadyPromises = [
      waitFor<string>(clientSocket1, "game:start"),
      waitFor<string>(clientSocket2, "game:start"),
    ];

    await Promise.all(userReadyPromises);

    clientSocket1.emit("game:get", Number(response));

    let res: GameState = await waitFor<GameState>(clientSocket1, "game:update");

    expect(res.cardIndex).toBe(-1);
    expect(res.playerTurn).toBe(PlayerId.Default);
  });

  it("Get game state failed because game does not exist", async () => {
    clientSocket1.emit("game:get", faker.number.int(100));

    let response: string = await waitFor<string>(clientSocket1, "game:error");
    expect(response).toBe("Game does not exist!");
  });

  it("Game Move failed because game does not exist", async () => {
    clientSocket1.emit("game:move", faker.number.int(10), faker.number.int(100), PlayerId.Player1);
    
    let response: string = await waitFor<string>(clientSocket1, "game:error");
    expect(response).toBe("Game does not exist!");
  })
});
