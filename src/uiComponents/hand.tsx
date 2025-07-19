import { useRef } from "react";
import { motion } from "framer-motion";
import { Box } from "@chakra-ui/react";
import Card from "@/uiComponents/card";
import { Pile, Card as TCard } from "@/types/types";
import { Player } from "@/model/player";

interface HandProp {
  cards: Pile;
  playCard: (c: TCard, p: Player) => void;
  player: Player;
  isFlipped: boolean;
}

export default function Hand({
  cards,
  playCard,
  player,
  isFlipped,
}: HandProp) {
  const ref = useRef<HTMLDivElement | null>(null);
  

  return (
    <Box
      ref={ref}
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      {cards.map((card, i) => (
        <motion.div
          key={card}
          custom={i}
          animate="show"
          transition={{ type: "tween" }}
          style={{
            transformOrigin: isFlipped ? "center top" : "center bottom",
          }}
        >
          <Card
            card={card}
            isFlipped={isFlipped}
            playCard={playCard}
            player={player}
          />
        </motion.div>
      ))}
    </Box>
  );
}


