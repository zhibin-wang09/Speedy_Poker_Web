import { Player } from "@server/model/player";
import { Card } from "../constant";

export interface userMoveInfo {
  card: Card;
  gameID: number;
  player: Player;
}
