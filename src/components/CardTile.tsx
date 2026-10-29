import React from 'react';
import { Star } from 'lucide-react';
import { FidelityCard } from '../types/card';
import { BrandLogo } from './BrandLogo';

interface CardTileProps {
  card: FidelityCard;
  onClick: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const CardTile: React.FC<CardTileProps> = ({
  card,
  onClick,
  onToggleFavorite,
}) => {
  const primary = card.color || '#1e293b';
  const secondary = card.gradientTo || card.color || '#334155';

  // Multi-solid color styling: crisp sharp-split geometric blocks
  const multiSolidBackground = `linear-gradient(135deg, ${primary} 0%, ${primary} 58%, ${secondary} 58%, ${secondary} 100%)`;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative w-full aspect-[1.58/1] rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between text-white cursor-pointer select-none transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] overflow-hidden border border-black/10 dark:border-white/10 shadow-md"
      style={{
        background: multiSolidBackground,
        backgroundColor: primary,
        boxShadow: `0 6px 20px -4px ${primary}40`,
      }}
    >
      {/* Top Row: Official Brand Logo & Category & Favorite Star */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BrandLogo
            storeName={card.storeName}
            customLogoUrl={card.logoUrl}
            primaryColor={primary}
            size="sm"
            className="shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase opacity-90 truncate text-white drop-shadow-xs bg-black/25 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {card.category}
          </span>
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className="w-7 h-7 -mr-1 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/20 backdrop-blur-xs transition-colors shrink-0"
            title={card.favorite ? 'Favorited' : 'Favorite'}
            aria-label="Toggle favorite"
          >
            <Star
              className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 drop-shadow-xs ${
                card.favorite ? 'fill-amber-300 text-amber-300' : 'text-white/80'
              }`}
            />
          </button>
        )}
      </div>

      {/* Main Brand / Store Name (clean, large and centered/bottom-anchored) */}
      <div className="relative z-10 pt-2">
        <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-md leading-tight line-clamp-2">
          {card.storeName}
        </h3>
      </div>
    </div>
  );
};
