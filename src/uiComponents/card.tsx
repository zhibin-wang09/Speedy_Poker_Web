import { Box } from "@chakra-ui/react";
import { getFaceValue, getSuit } from "@/utils/cardApi";
import { Card as TCard, FaceValue, Suit } from "@/types/types";
import { Player } from "@/model/player";
import { motion } from "framer-motion";

interface CardProp {
  card: TCard;
  isFlipped: boolean;
  playCard?: (c: TCard, p: Player) => void;
  player?: Player;
}

export default function Card({
  card,
  isFlipped,
  playCard,
  player,
}: CardProp) {
  const isFace = !isFlipped && card !== undefined;
  const src = isFace ? createCardSVGPath(card!) : CARD_BACK_SVG_PATH;

  return (
    <Box
      data-testid={`card-${card}-div`}
      id={player == null ? "" : `player${player}-card${card}`}
      margin={{base: "1%"}}
    >
      <motion.img
        data-testid={`card-${card}`}
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => {
          if (player != null && playCard && !isFlipped) playCard(card, player);
        }}
        src={src}
        layoutId={card?.toString()} // Framer motion use layoutId to animate the image transition whne Card is removed from one component to another component
        className="size-40 inline"
      />
    </Box>
  );
}

const CARDS_PREFIX_PATH = "/cards/";
const CARD_BACK_SVG_PATH = `${CARDS_PREFIX_PATH}BACK.svg`;

function createCardSVGPath(card: TCard) {
  return (
    CARDS_PREFIX_PATH +
    SuitePathCompLUT[getSuit(card)] +
    "-" +
    RankPathCompLUT[getFaceValue(card)] +
    ".svg"
  );
}

const SuitePathCompLUT: Record<Suit, string> = {
  [Suit.Clubs]: "CLUB",
  [Suit.Diamonds]: "DIAMOND",
  [Suit.Hearts]: "HEART",
  [Suit.Spades]: "SPADE",
};

const RankPathCompLUT: Record<FaceValue, string> = {
  [FaceValue.Ace]: "1",
  [FaceValue.Two]: "2",
  [FaceValue.Three]: "3",
  [FaceValue.Four]: "4",
  [FaceValue.Five]: "5",
  [FaceValue.Six]: "6",
  [FaceValue.Seven]: "7",
  [FaceValue.Eight]: "8",
  [FaceValue.Nine]: "9",
  [FaceValue.Ten]: "10",
  [FaceValue.Jack]: "11-JACK",
  [FaceValue.Queen]: "12-QUEEN",
  [FaceValue.King]: "13-KING",
};
