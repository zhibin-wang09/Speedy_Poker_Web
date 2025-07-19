"use client";
import { motion } from "framer-motion";
import {
  Box,
  Center,
  HoverCard,
  HStack,
  Portal,
  Strong,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaInfoCircle } from "react-icons/fa";
import { Mode } from "@/constant/type";

export default function Home() {
  const router = useRouter();

  function onButtonPress(event: React.MouseEvent<HTMLButtonElement>) {
    router.push(`/form/${event.currentTarget.value}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
    >
      <Center minH="100vh">
        <VStack align="stretch">
          <HStack>
            <Text fontSize="4xl" as="b">
              Taratari
            </Text>
            <HoverCard.Root positioning={{ placement: "top" }}>
              <HoverCard.Trigger asChild>
                <FaInfoCircle />
              </HoverCard.Trigger>
              <Portal>
                <HoverCard.Positioner>
                  <HoverCard.Content maxWidth="240px">
                    <HoverCard.Arrow />
                    <Box>
                      <Strong>Taratari</Strong> is card game where we compete to
                      finish our cards on hand. But you <Strong>WILL</Strong> be
                      punished if you spam the cards(you're using the wrong
                      card)
                    </Box>
                    <Box> </Box>
                    <Box>
                      You can play cards that's one position away from the
                      middle card(you can play card 2 or 4 if the target card is
                      3)
                    </Box>
                  </HoverCard.Content>
                </HoverCard.Positioner>
              </Portal>
            </HoverCard.Root>
          </HStack>
          <Button onClick={onButtonPress} value={Mode.Create}>
            Create Game
          </Button>
          <Button onClick={onButtonPress} value={Mode.Join}>
            Join Game
          </Button>
          <Button onClick={onButtonPress} value={Mode.JoinAny}>
            Join Any Game
          </Button>
        </VStack>
      </Center>
    </motion.div>
  );
}
