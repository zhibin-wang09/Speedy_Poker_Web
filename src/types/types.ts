import { Game } from "@/model/game";

export enum Suit {
  Diamonds,
  Clubs,
  Hearts,
  Spades,
}

export enum FaceValue {
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace,
}

export enum Destination {
  P1hand,
  P2hand,
  P1DrawPile,
  P2DrawPile,
  CenterPile1,
  CenterPile2,
  centerDrawPile1,
  centerDrawPile2,
}

export enum PlayerId {
  Default,
  Player1,
  Player2,
}

export const CARD_HOLDER = -1;
export type Card = number;
export const SUIT_BIN_WIDTH = 2; // two bits used to store information about the suite of a card because there are only 4 suites so 00, 01, 10, 11
export type Cards = Card[];
export type Deck = Cards;
export type Pile = Cards;

export interface GameState {
  game: Game,
  playerTurn: PlayerId,
  cardIndex: number,
  destination: 0,
  newCard: -1,
}