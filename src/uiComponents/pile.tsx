import { Circle, Float, HStack, Text } from "@chakra-ui/react";
import { Pile as cPile } from "@/types/types";
import Card from "./card";

interface PileProp {
  Cards: cPile;
  isFlipped: boolean;
  showNumberOfCardsInPile: boolean;
  disposition: string;
}

export default function Pile({
  Cards,
  isFlipped,
  showNumberOfCardsInPile,
  disposition
}: PileProp) {
  return (
    <>
      <HStack position="relative" margin={{base: "3%"}} right={disposition}>
        {Cards === undefined ? (
          ""
        ) : (
          <>
            <Card key={Cards[0]} card={Cards[0]} isFlipped={isFlipped} />
            {showNumberOfCardsInPile ? (
              <Float>
                <Circle size={5} bg={"black"} color="white">
                  {Cards.length}
                </Circle>
              </Float>
            ) : (
              <></>
            )}
          </>
        )}
      </HStack>
    </>
  );
}
