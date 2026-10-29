import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Star,
  Edit2,
  Trash2,
  Maximize2,
  Minimize2,
  Award,
  Share2,
} from 'lucide-react';
import { FidelityCard } from '../types/card';
import { formatCardNumberDisplay } from '../utils/barcode';
import { BarcodeRenderer } from './BarcodeRenderer';
import { BrandLogo } from './BrandLogo';

interface CardDetailModalProps {
  card: FidelityCard | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: FidelityCard) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdatePoints?: (card: FidelityCard, newPoints: number) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdatePoints,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [cashierMode, setCashierMode] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  if (!isOpen || !card) return null;

  const designImage = card.frontImage || card.cardDesignUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(card.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.storeName} Card`,
          text: `${card.storeName} card number: ${card.cardNumber}`,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  // Fullscreen Cashier Scanning View (Stocard core feature)
  if (cashierMode) {
    return (
      <div className="fixed inset-0 z-50 bg-white text-black flex flex-col justify-between p-6 animate-in fade-in duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo
              storeName={card.storeName}
              customLogoUrl={card.logoUrl}
              primaryColor={card.color}
              size="sm"
            />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {card.storeName}
            </h2>
          </div>
          <button
            onClick={() => setCashierMode(false)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            title="Exit cashier mode"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Massive scannable barcode for cashier gun */}
        <div className="flex-1 flex flex-col items-center justify-center my-6 space-y-4">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col items-center justify-center">
            <BarcodeRenderer
              value={card.cardNumber}
              format={card.barcodeFormat}
              height={140}
              widthScale={2.5}
            />
            <div className="mt-4 font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-900">
              {formatCardNumberDisplay(card.cardNumber)}
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">
              {card.barcodeFormat} · Ready for checkout scanner
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setCashierMode(false)}
            className="w-full max-w-md mx-auto py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-2xl hover:bg-slate-800 transition-colors shadow-md"
          >
            Done Scanning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Top Header Card Banner - Displays authentic card physical artwork if found, otherwise multi-solid colors */}
        <div
          className="relative px-6 pt-6 pb-8 text-white transition-all overflow-hidden shrink-0 aspect-[1.8/1] flex flex-col justify-between"
          style={{
            background: designImage
              ? `url("${designImage}") center/cover no-repeat`
              : `linear-gradient(135deg, ${card.color} 0%, ${card.color} 58%, ${card.gradientTo || card.color} 58%, ${card.gradientTo || card.color} 100%)`,
            backgroundColor: card.color,
          }}
        >
          {designImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/40 pointer-events-none" />
          )}

          {/* Action header icons */}
          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => onToggleFavorite(card.id)}
              className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-colors border border-white/10"
              title={card.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${card.favorite ? 'fill-amber-300 text-amber-300' : 'text-white'}`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-colors border border-white/10"
                title="Share card number"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(card)}
                className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-colors border border-white/10"
                title="Edit card"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-colors border border-white/10"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Title, Brand Logo & Category */}
          <div className="relative z-10 flex items-center gap-3.5">
            <BrandLogo
              storeName={card.storeName}
              customLogoUrl={card.logoUrl}
              primaryColor={card.color}
              size="lg"
              className="shadow-xl ring-2 ring-black/20"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90 drop-shadow-xs bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
                {card.category} · LOYALTY CARD
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md truncate mt-0.5">
                {card.storeName}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 -mt-3 bg-white dark:bg-slate-900 rounded-t-3xl relative z-10">
          {/* Primary Barcode Box */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {card.barcodeFormat}
              </span>
              <button
                type="button"
                onClick={() => setCashierMode(true)}
                className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen Cashier Mode
              </button>
            </div>

            {/* The Barcode View */}
            <div
              onClick={() => setCashierMode(true)}
              className="cursor-pointer hover:opacity-95 transition-opacity w-full flex justify-center py-2"
              title="Tap for fullscreen cashier scanning"
            >
              <BarcodeRenderer
                value={card.cardNumber}
                format={card.barcodeFormat}
                height={100}
                widthScale={2}
              />
            </div>

            {/* Card Number display with copy action */}
            <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-slate-900 dark:text-slate-100">
                {formatCardNumberDisplay(card.cardNumber)}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Points & Rewards Tracker */}
          {card.pointsBalance !== undefined && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Reward Points Balance</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    {card.pointsBalance.toLocaleString()} pts
                  </div>
                </div>
              </div>
              {onUpdatePoints && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdatePoints(card, Math.max(0, (card.pointsBalance || 0) - 10))}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdatePoints(card, (card.pointsBalance || 0) + 10)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes & Perks */}
          {card.notes && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notes & Member Perks
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {card.notes}
              </p>
            </div>
          )}

          {/* Delete Option */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Delete this card from wallet?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDelete(card.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
