import { Game } from "@server/model/game";
import { Destination, PlayerId } from "../enums";

export interface GameState {
  game: Game;
  playerTurn: PlayerId; // the playe's turn
  cardIndex: number; // the index of the card on the player hand that's used
  destination: Destination; // the center pile that's updated
  newCard: number;
}