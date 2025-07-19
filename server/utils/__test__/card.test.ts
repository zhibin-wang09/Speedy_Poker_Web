import { describe, it, expect, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { createDeck, dealCards, shuffle } from "@server/utils/card";
import { Deck } from "@server/types/constant";

describe("Card Utility", () => {
  it("Card: deck should have 52 cards", () => {
    let deck = createDeck();
    expect(deck.length).toBe(52);
  });

  it("Card: deck should have all unique cards", () => {
    let deck = createDeck();
    let isCardsUnique = (cards: Deck) =>
      Array.isArray(cards) && new Set(cards).size === cards.length;
    expect(isCardsUnique(deck)).toBeTruthy();
  });

  it("Card: shuffle should move deck into random order", () => {
    let deck = createDeck();
    let deckCopy = structuredClone(deck);
    shuffle(deck);
    expect(deck).not.toEqual(deckCopy);
  });

  it("Card: deal cards should deal the correct number of cards", () => {
    let randomInt = faker.number.int(52);

    let deck = createDeck();
    let pile = dealCards(deck, randomInt);

    expect(pile.length).toBe(randomInt);
  });
});
