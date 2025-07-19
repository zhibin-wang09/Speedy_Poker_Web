import { describe, it, expect, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { Game } from "@/model/game";
import {
  Destination,
  FaceValue,
  PlayerId,
  Suit,
  Validality,
} from "@/types/enums";
import { GameState } from "@/types/response_types/updated_game_response";
import { createCard } from "@/utils/card";

describe("Game behvaiors", () => {
  it("Game constructor: initialized with proper properties", () => {
    let gameID = faker.number.int(100);
    let game: Game = new Game(gameID);

    expect(game.numberOfPlayers).toBe(0);

    expect(game.gameID).toBe(gameID);
    for (const player of game.players) {
      expect(player.hand.length).toBe(0);
      expect(player.drawPile.length).toBe(0);
    }
    expect(game.centerPile1.length).toBe(0);
    expect(game.centerPile2.length).toBe(0);
    expect(game.centerDrawPile1.length).toBe(0);
    expect(game.centerDrawPile2.length).toBe(0);
  });

  it("Game useCard: return undefined when invalid player is default", () => {
    let game: Game = new Game(faker.number.int(100));
    expect(game.numberOfPlayers).toBe(0);

    let gameState = game.useCard(faker.number.int(10), PlayerId.Default);

    expect(gameState).toBe(undefined);
  });

  it("Game useCard: return new game state when valid move is made", () => {
    let game: Game = new Game(faker.number.int(100));
    game.playerJoin("player 1", faker.string.fromCharacters("abc", 10));
    game.playerJoin("player 2", faker.string.fromCharacters("abc", 10));

    expect(game.numberOfPlayers).toBe(2);

    // find a valid card and use it
    for (const player of game.players) {
      for (const card of player.hand) {
        let valid = game.validateMove(
          game.centerPile1[0],
          game.centerPile2[0],
          card
        );
        if (
          valid == Validality.CENTER1VALID ||
          valid == Validality.CENTER2VALID
        ) {
          let gameState: GameState | undefined = game.useCard(
            card,
            player.playerId
          );
          expect(gameState).not.toBe(undefined);
        }
      }
    }
  });

  it("Game useCard: invalid move returns game state with special values", () => {
    let game: Game = new Game(faker.number.int(100));
    game.playerJoin("player 1", faker.string.fromCharacters("abc", 10));
    game.playerJoin("player 2", faker.string.fromCharacters("abc", 10));

    expect(game.numberOfPlayers).toBe(2);

    // find a valid card and use it
    for (const player of game.players) {
      player.point = 10;
      for (const card of player.hand) {
        let valid = game.validateMove(
          game.centerPile1[0],
          game.centerPile2[0],
          card
        );
        if (valid == Validality.INVALID) {
          let gameState: GameState | undefined = game.useCard(
            card,
            player.playerId
          );
          expect(gameState?.cardIndex).toBe(-1); // move is not made
          expect(gameState?.newCard).toBe(-1);
        }
      }
    }
  });

  it("Game useCard: update relevant game properties when valid move is made", () => {
    // relevant properties as such:
    // new center pile
    // new center draw pile
    // player hand is updated
    // player drawpile has less cards
    // player has more points

    let game: Game = new Game(faker.number.int(100));
    game.playerJoin("player 1", faker.string.fromCharacters("abc", 10));
    game.playerJoin("player 2", faker.string.fromCharacters("abc", 10));

    expect(game.numberOfPlayers).toBe(2);
    let originalDiscardPileLength = game.discardedPile.length;

    // find a valid card and use it
    for (const player of game.players) {
      player.point = 10;
      let originalDrawPileLength = player.drawPile.length;
      for (const card of player.hand) {
        let valid = game.validateMove(
          game.centerPile1[0],
          game.centerPile2[0],
          card
        );
        if (
          valid == Validality.CENTER1VALID ||
          valid == Validality.CENTER2VALID
        ) {
          let gameState: GameState | undefined = game.useCard(
            card,
            player.playerId
          );
          expect(gameState?.cardIndex).not.toBe(-1);
          expect(player.drawPile.length).lessThan(originalDrawPileLength);
          expect(gameState?.playerTurn).toBe(player.playerId);
          expect(Object.values(Destination)).toContain(
            Destination[gameState!.destination]
          );
          expect(gameState?.game.discardedPile.length).greaterThan(
            originalDiscardPileLength
          );
        }
      }
    }
  });

  it("Game playerJoin: correctly update player in order of them joining", () => {
    let game: Game = new Game(faker.number.int(100));
    let player1Name = faker.string.sample(5);
    let player2Name = faker.string.sample(5);

    game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(1);

    expect(game.centerPile1.length).toBe(0);

    game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(2);

    expect(game.players[0].name).toBe(player1Name);
    expect(game.players[1].name).toBe(player2Name);

    expect(game.centerDrawPile1.length).toBe(5);
    for (const player of game.players) {
      expect(player.hand.length).toBe(4);
      expect(player.drawPile.length).toBe(16);
    }
  });

  it("Game playerJoin: Can not have more than two players", () => {
    let game: Game = new Game(faker.number.int(100));
    let player1Name = faker.string.sample(5);
    let player2Name = faker.string.sample(5);
    let player3Name = faker.string.sample(5);

    game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(1);

    game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(2);

    game.playerJoin(player3Name, faker.string.fromCharacters("abc", 10)); // third player joins

    expect(game.numberOfPlayers).toBe(2); // stays at two players
    expect(game.players[0].name).toBe(player1Name);
    expect(game.players[1].name).toBe(player2Name);
  });

  it("Game isDead: correctly identify a dead game", () => {
    // dead game is when users can not play any valid cards in the center pile
  });

  it("Game isDead: identify a alive game", () => {});

  it("Game winner: identify winner and loser base on number of cards in hand", () => {
    let game: Game = new Game(faker.number.int(100));
    let player1Name = faker.string.sample(5);
    let player2Name = faker.string.sample(5);

    game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
    game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));

    let player1 = game.players[0];
    let player2 = game.players[1];

    player1.hand = [];

    let result = game.winner();
    expect(result).not.toBe(undefined);
    expect(result!.winner).toEqual(player1);
    expect(result!.loser).toEqual(player2);
  });

  it("Game winner: identify winner and loser base on points", () => {
    let game: Game = new Game(faker.number.int(100));
    let player1Name = faker.string.sample(5);
    let player2Name = faker.string.sample(5);

    game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(1);

    game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(2);

    let player1 = game.players[0];
    let player2 = game.players[1];

    player1.hand = [];
    player2.point = 100;

    let result = game.winner();

    expect(result).not.toBe(undefined);
    expect(result!.winner).toEqual(player2);
    expect(result!.loser).toEqual(player1);
  });

  it("Game winner: does not have a winnner yet", () => {
    let game: Game = new Game(faker.number.int(100));
    let player1Name = faker.string.sample(5);
    let player2Name = faker.string.sample(5);

    game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(1);

    game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));
    expect(game.numberOfPlayers).toBe(2);

    let player1 = game.players[0];
    let player2 = game.players[1];

    let result = game.winner();

    expect(result).toBe(undefined);
  });
});

describe("Card value validations", () => {
  const invalidTestCases = [
    {
      input: [FaceValue.Ace, FaceValue.Three],
      expected: Validality.INVALID,
    },
    {
      input: [FaceValue.Five, FaceValue.Three],
      expected: Validality.INVALID,
    },
    {
      input: [FaceValue.Five, FaceValue.Seven],
      expected: Validality.INVALID,
    },
    {
      input: [FaceValue.Seven, FaceValue.Nine],
      expected: Validality.INVALID,
    },
    {
      input: [FaceValue.Nine, FaceValue.Jack],
      expected: Validality.INVALID,
    },
    {
      input: [FaceValue.Jack, FaceValue.King],
      expected: Validality.INVALID,
    },
    {
      input: [FaceValue.Two, FaceValue.Four],
      expected: Validality.INVALID,
    },
  ];

  const validTestCases = [
    {
      input: [FaceValue.Ace, FaceValue.Two],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
    {
      input: [FaceValue.Ace, FaceValue.King],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
    {
      input: [FaceValue.Jack, FaceValue.Queen],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
    {
      input: [FaceValue.Five, FaceValue.Six],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
    {
      input: [FaceValue.Two, FaceValue.Three],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
    {
      input: [FaceValue.Four, FaceValue.Five],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
    {
      input: [FaceValue.Ten, FaceValue.Jack],
      expected: [Validality.CENTER1VALID, Validality.CENTER2VALID],
    },
  ];

  it.each(validTestCases)(
    "Card validateMove: should validate valid card usage",
    ({ input, expected }) => {
      let game: Game = new Game(faker.number.int(100));
      let player1Name = faker.string.sample(5);
      let player2Name = faker.string.sample(5);

      game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
      game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));
      let validality = game.validateMove(
        createCard(Suit.Clubs, input[0]),
        createCard(Suit.Clubs, input[0]),
        createCard(Suit.Clubs, input[1])
      );
      expect(expected).toContain(validality);
    }
  );

  it.each(invalidTestCases)(
    "Card validateMove: should invalidate any invalid card usage",
    ({ input, expected }) => {
      let game: Game = new Game(faker.number.int(100));
      let player1Name = faker.string.sample(5);
      let player2Name = faker.string.sample(5);

      game.playerJoin(player1Name, faker.string.fromCharacters("abc", 10));
      game.playerJoin(player2Name, faker.string.fromCharacters("abc", 10));
      let validality = game.validateMove(
        createCard(Suit.Clubs, input[0]),
        createCard(Suit.Clubs, input[0]),
        createCard(Suit.Clubs, input[1])
      );
      expect(validality).toBe(expected);
    }
  );
});
