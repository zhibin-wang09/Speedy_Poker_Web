import config from "@server/config/config";
import { Game } from "@server/model/game";
import { Player } from "@server/model/player";
import { pino } from "pino";

export const CARD_HOLDER = -1;
export type Card = number;
export const SUIT_BIN_WIDTH = 2; // two bits used to store information about the suite of a card because there are only 4 suites so 00, 01, 10, 11
export type Cards = Card[];
export type Deck = Cards;
export type Pile = Cards;

export const logger = pino();

export type pileAndHand = {
  pile: Pile;
  hand: Cards;
};

export interface WinnerAndLoser {
  winner: Player;
  loser: Player;
}

export const games = new Map<number, Game>();
export const socketToGame = new Map<string, Game>();
