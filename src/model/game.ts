import { Pile } from "@/types/types";
import { Player } from "./player";

export class Game {
  gameID: number = -1;
  players: Player[] = [];
  centerPile1: Pile = [];
  centerPile2: Pile = [];
  centerDrawPile1: Pile = [];
  centerDrawPile2: Pile = [];
  discardedPile: Pile = [];
  numberOfPlayers: number = 0;
}
