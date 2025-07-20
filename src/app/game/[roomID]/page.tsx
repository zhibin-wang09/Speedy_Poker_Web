"use client";
import { useEffect, useState } from "react";
import Hand from "@/uiComponents/hand";
import Pile from "@/uiComponents/pile";
import { Pile as TPile, Card, PlayerId } from "@/types/types";
import { Box, Text } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { socket } from "@/socketClient";
import { useParams, useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { Player } from "@/model/player";
import { Game } from "@/model/game";

export default function Page() {
  const [centerPile1, setcenterPile1] = useState<TPile>([]);
  const [centerPile2, setcenterPile2] = useState<TPile>([]);
  const [centerDrawPile1, setcenterDrawPile1] = useState<TPile>([]);
  const [centerDrawPile2, setcenterDrawPile2] = useState<TPile>([]);
  const [localPlayer, setLocalPlayer] = useState<Player>(
    new Player("", "", [], [], PlayerId.Default)
  );
  const [opponentPlayer, setOpponentPlayer] = useState<Player>(
    new Player("", "", [], [], PlayerId.Default)
  );
  const param = useParams<{ roomID: string }>();
  const [haveWinner, setHaveWinner] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    socket.emit("game:get", parseInt(param.roomID));

    socket.on("game:update", (response) => {
      const game: Game = response.game;
      for (const p of game.players) {
        if (p.socketId == socket.id) {
          setLocalPlayer(p);
        } else {
          setOpponentPlayer(p);
        }
      }
      if (game) {
        setcenterDrawPile1(game.centerDrawPile1);
        setcenterDrawPile2(game.centerDrawPile2);
        setcenterPile1(game.centerPile1);
        setcenterPile2(game.centerPile2);
      }
    });

    socket.on("game:result", (response) => {
      toaster.create({
        description: response,
        duration: 6000,
      });
      if (response.toLowerCase().includes("won")) {
        setHaveWinner(true);
      } else {
        setHaveWinner(false);
      }
      setTimeout(() => {
        router.push("/");
      }, 5000);
    });

    socket.on("game:disconnect", (response: string) => {
      toaster.create({
        description: response,
        duration: 2000,
      });
      setTimeout(() => {
        router.push("/");
      }, 1000);
    });

    socket.on("game:error", (errorMessage: string) => {
      toaster.create({
        description: errorMessage,
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    });
    return () => {
      socket.off("game:update");
      socket.off("game:result");
      socket.off("game:disconnect");
      socket.off("game:error");
    };
  }, [router, param.roomID]);

  function playCard(card: Card, player: Player) {
    socket.emit("game:move", {
      card: card,
      gameId: parseInt(param.roomID),
      playerId: player.playerId,
    });
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDirection="column"
      backgroundColor="black"
      minH="100vh"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Hand
          cards={opponentPlayer.hand}
          playCard={playCard}
          player={opponentPlayer}
          isFlipped={true}
        ></Hand>
        <Pile
          Cards={opponentPlayer.drawPile}
          isFlipped={true}
          showNumberOfCardsInPile={true}
        />
      </Box>
      <Box>
        <Text>Score: {opponentPlayer.point}</Text>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Pile
          Cards={centerDrawPile1}
          isFlipped={true}
          showNumberOfCardsInPile={false}
        />
        <Pile
          Cards={centerPile1}
          isFlipped={false}
          showNumberOfCardsInPile={false}
        />
        <Pile
          Cards={centerPile2}
          isFlipped={false}
          showNumberOfCardsInPile={false}
        />
        <Pile
          Cards={centerDrawPile2}
          isFlipped={true}
          showNumberOfCardsInPile={false}
        />
      </Box>
      <Box>
        <Text>Score: {localPlayer.point}</Text>
      </Box>
      <Box display="flex" alignItems="center">
        <Hand
          cards={localPlayer.hand}
          playCard={playCard}
          player={localPlayer}
          isFlipped={false}
        ></Hand>
        <Pile
          Cards={localPlayer.drawPile}
          isFlipped={true}
          showNumberOfCardsInPile={true}
        />
      </Box>
      <Toaster />
      {haveWinner ? <Confetti /> : <></>}
    </Box>
  );
}
