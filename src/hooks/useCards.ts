import { useState, useEffect, useCallback } from 'react';
import { FidelityCard } from '../types/card';
import { INITIAL_CARDS } from '../data/initialCards';
import { sortCardsAlphabetically } from '../utils/fuzzySearch';

const CARDS_STORAGE_KEY = 'stocard_fidelity_cards_v2';

export function useCards() {
  const [cards, setCards] = useState<FidelityCard[]>(() => {
    try {
      const stored = localStorage.getItem(CARDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sortCardsAlphabetically(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored fidelity cards:', e);
    }
    return sortCardsAlphabetically(INITIAL_CARDS);
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save fidelity cards to storage:', e);
    }
  }, [cards]);

  const addCard = useCallback((newCard: Omit<FidelityCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const card: FidelityCard = {
      ...newCard,
      id: 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCards((prev) => sortCardsAlphabetically([card, ...prev]));
    return card;
  }, []);

  const updateCard = useCallback((updated: FidelityCard) => {
    setCards((prev) =>
      sortCardsAlphabetically(
        prev.map((c) => (c.id === updated.id ? { ...updated, updatedAt: Date.now() } : c))
      )
    );
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite, updatedAt: Date.now() } : c))
    );
  }, []);

  const recordCardUsage = useCallback((id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lastUsedAt: Date.now() } : c))
    );
  }, []);

  const resetToSampleCards = useCallback(() => {
    setCards(sortCardsAlphabetically(INITIAL_CARDS));
  }, []);

  const exportCardsJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stocard_cards_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [cards]);

  const importCardsJson = useCallback((jsonString: string): { success: boolean; count?: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'Formato file JSON non valido: atteso un array di carte.' };
      }
      const validCards: FidelityCard[] = [];
      for (const item of parsed) {
        if (typeof item.storeName === 'string' && typeof item.cardNumber === 'string') {
          validCards.push({
            id: item.id || 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            storeName: item.storeName,
            category: item.category || 'grocery',
            cardNumber: item.cardNumber,
            barcodeFormat: item.barcodeFormat || 'EAN13',
            color: item.color || '#073a26',
            gradientTo: item.gradientTo || '#032014',
            textColor: item.textColor || 'light',
            pointsBalance: typeof item.pointsBalance === 'number' ? item.pointsBalance : undefined,
            notes: item.notes || '',
            favorite: Boolean(item.favorite),
            createdAt: item.createdAt || Date.now(),
            updatedAt: Date.now(),
            frontImage: item.frontImage,
            backImage: item.backImage,
            cardDesignUrl: item.cardDesignUrl,
          });
        }
      }

      if (validCards.length === 0) {
        return { success: false, error: 'Nessuna carta valida trovata nel file.' };
      }

      setCards(sortCardsAlphabetically(validCards));
      return { success: true, count: validCards.length };
    } catch (err: any) {
      return { success: false, error: err.message || 'Errore durante la lettura del file' };
    }
  }, []);

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    toggleFavorite,
    recordCardUsage,
    resetToSampleCards,
    exportCardsJson,
    importCardsJson,
  };
}
