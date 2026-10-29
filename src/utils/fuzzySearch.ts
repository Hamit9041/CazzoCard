import Fuse, { type IFuseOptions } from 'fuse.js';
import { FidelityCard } from '../types/card';

const fuseOptions: IFuseOptions<FidelityCard> = {
  keys: [
    { name: 'storeName', weight: 0.55 },
    { name: 'category', weight: 0.2 },
    { name: 'cardNumber', weight: 0.15 },
    { name: 'notes', weight: 0.1 },
  ],
  threshold: 0.4, // Good balance of typo tolerance without false positives
  distance: 100,
  minMatchCharLength: 1,
  ignoreLocation: true,
};

export function fuzzySearchCards(cards: FidelityCard[], query: string): FidelityCard[] {
  const trimmed = query.trim();
  if (!trimmed) {
    // If empty query, return all cards in alphabetical order
    return sortCardsAlphabetically(cards);
  }

  const fuse = new Fuse(cards, fuseOptions);
  const results = fuse.search(trimmed);
  return results.map((result) => result.item);
}

export function sortCardsAlphabetically(cards: FidelityCard[]): FidelityCard[] {
  return [...cards].sort((a, b) =>
    a.storeName.localeCompare(b.storeName, undefined, { sensitivity: 'base' })
  );
}

export function groupCardsByInitial(cards: FidelityCard[]): Record<string, FidelityCard[]> {
  const groups: Record<string, FidelityCard[]> = {};
  for (const card of cards) {
    const firstChar = card.storeName.trim().charAt(0).toUpperCase();
    const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(card);
  }
  return groups;
}
