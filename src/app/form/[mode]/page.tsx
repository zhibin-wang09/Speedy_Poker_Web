"use client";
import { Mode } from "@/constant/type";
import { socket } from "@/socketClient";
import { Button, Center, Field, Input, Switch, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Toaster, toaster } from "@/components/ui/toaster";

interface FormData {
  playerName: string;
  roomId: number;
  isPrivateRoom: boolean;
}

export default function Form() {
  const params = useParams<{ mode: string }>();
  const router = useRouter();

  useEffect(() => {
    socket.on("user:joined", (roomId: string) => {
      router.push(`/wait/${roomId}`);
    });

    socket.on("game:error", (errorMessage: string) => {
      toaster.create({
        description: errorMessage,
        duration: 2000,
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    });

    return () => {
      socket.off("user:joined");
      socket.off("game:error");
    };
  }, [router]);

  const buttonText =
    params.mode == Mode.Join
      ? "Join Game"
      : params.mode == Mode.JoinAny
      ? "Join Any Active Game"
      : "Create Game";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      isPrivateRoom: false,
    }
  });

  const joinGame: SubmitHandler<FormData> = (data: FormData) => {
    switch (params.mode) {
      case Mode.Create:
        socket.emit("user:create", data.playerName, data.isPrivateRoom);
        break;
      case Mode.Join:
        socket.emit("user:join", data.roomId, data.playerName);
        break;
      case Mode.JoinAny:
        socket.emit("user:join_any", data.playerName);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
    >
      <form onSubmit={handleSubmit(joinGame)}>
        <Center minH="100svh">
          <VStack align="stretch">
            <Field.Root invalid={!!errors.playerName} required>
              <Field.Label>
                Player Name
                <Field.RequiredIndicator />
              </Field.Label>
              <Field.ErrorText>{errors.playerName?.message}</Field.ErrorText>
              <Input
                {...register("playerName", {
                  required: "Name is required",
                })}
                placeholder="Ex. Raisa"
              ></Input>
            </Field.Root>
            {params.mode == Mode.Create && (
              <Controller
                name="isPrivateRoom"
                control={control}
                render={({ field }) => {
                  return (
                    <Field.Root>
                      <Switch.Root
                        checked={field.value}
                        name={field.name}
                        onCheckedChange={(e) => field.onChange(e.checked)}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control />
                        <Switch.Label>{'Private Room ' + (field.value ? 'ON' : 'OFF')}</Switch.Label>
                      </Switch.Root> 
                    </Field.Root>
                  );
                }}
              ></Controller>
            )}
            {params.mode == Mode.Join && (
              <Field.Root invalid={!!errors.roomId} required>
                <Field.Label>
                  Room ID
                  <Field.RequiredIndicator />
                </Field.Label>
                <Field.ErrorText>{errors.roomId?.message}</Field.ErrorText>
                <Input
                  {...register("roomId", {
                    valueAsNumber: true,
                    validate: (value) =>
                      (value != undefined && !isNaN(value)) ||
                      "Room ID must be a number",
                  })}
                  placeholder="Ex. 140183"
                ></Input>
              </Field.Root>
            )}
            <Button
              type="submit"
              variant="solid"
              loading={isSubmitting}
              loadingText="Starting up..."
            >
              {buttonText}
            </Button>
            <Button onClick={() => router.back()}>Go Back</Button>
          </VStack>
        </Center>
      </form>
      <Toaster />
    </motion.div>
  );
}
