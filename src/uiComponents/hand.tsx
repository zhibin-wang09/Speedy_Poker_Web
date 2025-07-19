import { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Box } from "@chakra-ui/react";
import Card from "@/uiComponents/card";
import { Pile, Card as TCard } from "@/types/types";
import { Player } from "@/model/player";

interface HandProp {
  cards: Pile;
  playCard: (c: TCard, p: Player) => void;
  player: Player;
  isFlipped: boolean;
  disposition: string;
}

export default function Hand({
  cards,
  playCard,
  player,
  isFlipped,
  disposition,
}: HandProp) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [handWidth, setHandWidth] = useState(0);
  const virtualFanWidth = Math.min(handWidth, cards.length * 100);
  const virtualFanHeight = virtualFanWidth * 0.75;

  useEffect(() => {
    const onResize = () => setHandWidth(ref.current!.clientWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function angle(i: number) {
    const factor = cards.length / 8; // Reduce denominator for a wider spread
    let x = offsetFromCenter(cards, i) * 0.08; // Increase multiplier for more spacing
    if (cards.length % 2 === 0) x += 0.04; // Adjust for even card counts
    return x * (Math.PI / factor);
  }

  const flippedSign = isFlipped ? -1 : 1;
  const hoverPad = 20;
  const variants: Variants = {
    show: (i: number) => ({
      y: virtualFanHeight * (1 - Math.cos(angle(i))) * flippedSign,
      x: virtualFanWidth * Math.sin(angle(i)) + 30, // Add a fixed value to shift to the right
      rotate: `${angle(i) * flippedSign}rad`,
    }),
  };

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
          className="absolute"
          variants={variants}
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

function offsetFromCenter<T>(array: T[], index: number): number {
  return index - Math.floor(array.length / 2);
}
