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
  const [roomID, setRoomID] = useState<string | undefined>();
  const param = useParams<{ roomID: string }>();
  const [haveWinner, setHaveWinner] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    socket.emit("game:get", parseInt(roomID!));

    socket.on("game:update", (response) => {
      const game: Game = response;
      for(let p of game.players){
        if(p.socketId == socket.id){
            setLocalPlayer(p);
        }else{
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
        duration: 5000,
      });
      setTimeout(() => {
        router.push("/");
      }, 5000);
    });

    return () => {
      socket.off("game:update");
      socket.off("game:result");
      socket.off("game:disconnect");
    };
  }, [roomID]);

  useEffect(() => {
    setRoomID(param.roomID);
  }, [param]);

  function playCard(card: Card, player: Player) {
    socket.emit("game:move", card, parseInt(roomID!), player);
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDirection="column"
      backgroundColor="black"
      height="100svh"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Hand
          cards={localPlayer.hand}
          playCard={playCard}
          player={localPlayer}
          isFlipped={true}
          disposition={"0%"}
        ></Hand>
        <Pile
          Cards={localPlayer.drawPile}
          isFlipped={true}
          showNumberOfCardsInPile={true}
          disposition={"-70%"}
        />
      </Box>
      <Box>
        <Text>Score: {localPlayer.point}</Text>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Pile
          Cards={centerDrawPile1}
          isFlipped={true}
          showNumberOfCardsInPile={false}
          disposition={"0%"}
        />
        <Pile
          Cards={centerPile1}
          isFlipped={false}
          showNumberOfCardsInPile={false}
          disposition={"0%"}
        />
        <Pile
          Cards={centerPile2}
          isFlipped={false}
          showNumberOfCardsInPile={false}
          disposition={"0%"}
        />
        <Pile
          Cards={centerDrawPile2}
          isFlipped={true}
          showNumberOfCardsInPile={false}
          disposition={"0%"}
        />
      </Box>
      <Box>
        <Text>Score: {opponentPlayer.point}</Text>
      </Box>
      <Box display="flex" alignItems="center">
        <Hand
          cards={opponentPlayer.hand}
          playCard={playCard}
          player={opponentPlayer}
          isFlipped={false}
          disposition={"0%"}
        ></Hand>
        <Pile
          Cards={opponentPlayer.drawPile}
          isFlipped={true}
          showNumberOfCardsInPile={true}
          disposition={"-70%"}
        />
      </Box>
      <Toaster />
      {haveWinner ? <Confetti /> : <></>}
    </Box>
  );
}
