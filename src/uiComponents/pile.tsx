import { Circle, Float, HStack } from "@chakra-ui/react";
import { Pile as cPile } from "@/types/types";
import Card from "./card";

interface PileProp {
  Cards: cPile;
  isFlipped: boolean;
  showNumberOfCardsInPile: boolean;
}

export default function Pile({
  Cards,
  isFlipped,
  showNumberOfCardsInPile,
}: PileProp) {
  return (
    <>
      <HStack position="relative" margin={{ base: "3%" }}>
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
