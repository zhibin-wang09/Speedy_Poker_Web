import { Cards, Pile } from "@server/types/constant";
import { PlayerId } from "@server/types/enums";

export class Player {
  hand: Cards = [];
  drawPile: Pile = [];
  playerId: PlayerId = PlayerId.Default;
  socketId: string;
  name: string;
  point: number;

  constructor(
    name: string,
    socketId: string,
    hand: Cards,
    drawPile: Pile,
    playerId: PlayerId
  ) {
    this.hand = hand;
    this.drawPile = drawPile;
    this.playerId = playerId;
    this.name = name;
    this.socketId = socketId;
    this.point = 0.0;
  }

  setHand(hand: Cards) {
    this.hand = hand;
  }
  setDrawPile(drawPile: Cards) {
    this.drawPile = drawPile;
  }
}
