import { Player } from "@/model/player";
import { Card } from "@server/types/constant";
import { PlayerId } from "@server/types/enums";

export interface ClientToServerEvents{
    "game:get": (gameID: number) => void;
    "game:move": (moveInfo : {card: Card, gameId: number, playerId: PlayerId}) => void;
    "user:join": (gameID: number, playerName: string) => void;
    "game:create": (playerName: string, isPrivateRoom: boolean) => void;
    "user:join_any" : (playerName: string) => void;
    "user:ready": (gameID: number) => void;
}