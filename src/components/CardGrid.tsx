import React from 'react';
import { FidelityCard } from '../types/card';
import { CardTile } from './CardTile';
import { Plus, SearchX, CreditCard } from 'lucide-react';

interface CardGridProps {
  cards: FidelityCard[];
  onSelectCard: (card: FidelityCard) => void;
  onToggleFavorite: (id: string) => void;
  onAddNewCard: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onSelectCard,
  onToggleFavorite,
  onAddNewCard,
  searchQuery,
  onClearSearch,
}) => {
  if (cards.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No cards found for "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-5">
            Check your spelling or add a new loyalty card with this name.
          </p>
          <div className="flex items-center gap-3">
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              onClick={onAddNewCard}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm"
            >
              Add Card "{searchQuery}"
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <CreditCard className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Your loyalty wallet is empty
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6 leading-relaxed">
          Store all your loyalty and reward cards (Esselunga, Conad, Coop, Decathlon, Trenitalia...).
          Scan the barcode with your camera or enter it manually.
        </p>
        <button
          type="button"
          onClick={onAddNewCard}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-2xl transition-all shadow-md shadow-rose-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add First Card
        </button>
      </div>
    );
  }

  // Pure rectangular grid only without alphabet headers
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <CardTile
          key={card.id}
          card={card}
          onClick={() => onSelectCard(card)}
          onToggleFavorite={() => onToggleFavorite(card.id)}
        />
      ))}
    </div>
  );
};
