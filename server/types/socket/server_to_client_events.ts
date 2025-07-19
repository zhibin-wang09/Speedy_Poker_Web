import { GameState } from "../response_types/updated_game_response";
import { Error } from "@/types/error";

export interface ServerToClientEvents {
  "game:update": (gameState: GameState | undefined) => void;
  "game:result": (result: string) => void;
  "user:joined": (gameID: string) => void;
  "game:start": () => void;
  "game:disconnect": (msg: string) => void;
  "game:error": (error: Error) => void;
}
