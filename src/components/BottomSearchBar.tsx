import React, { useRef, useEffect, useState } from 'react';
import { Search, X, Plus, Camera, Edit3 } from 'lucide-react';

interface BottomSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onOpenManualInsert: () => void;
  onOpenScanner: () => void;
  onOpenReceiptOCR?: () => void;
  activeSection?: 'cards' | 'receipts';
  totalCardsCount: number;
  filteredCount: number;
}

export const BottomSearchBar: React.FC<BottomSearchBarProps> = ({
  value,
  onChange,
  onClear,
  onOpenManualInsert,
  onOpenScanner,
  onOpenReceiptOCR,
  activeSection = 'cards',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isBalloonOpen, setIsBalloonOpen] = useState<boolean>(false);

  // Close balloon when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsBalloonOpen(false);
      }
    };
    if (isBalloonOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBalloonOpen]);

  // Global hotkey '/' or 'Ctrl+K' to focus bottom search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (isBalloonOpen) {
          setIsBalloonOpen(false);
        } else if (document.activeElement === inputRef.current) {
          inputRef.current?.blur();
          if (value) onClear();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onClear, isBalloonOpen]);

  const isFiltered = value.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div
        ref={containerRef}
        className="relative max-w-2xl mx-auto flex items-center gap-2 pointer-events-auto"
      >
        {/* Balloon Multi-Select (Vertically Arranged Icons Only) popping up above the + button */}
        {isBalloonOpen && (
          <div className="absolute right-0 bottom-16 mb-[10px] z-50 flex flex-col items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Top Option: Camera Scan (Icon only) */}
            <button
              type="button"
              onClick={() => {
                setIsBalloonOpen(false);
                onOpenScanner();
              }}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all active:scale-95"
              title="Scan barcode with camera"
              aria-label="Scan barcode with camera"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Bottom Option: Manual Insert (Icon only) */}
            <button
              type="button"
              onClick={() => {
                setIsBalloonOpen(false);
                onOpenManualInsert();
              }}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all active:scale-95"
              title="Manual card entry"
              aria-label="Manual card entry"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Floating Search Bar */}
        <div className="flex-1 flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 px-3.5 py-[6px] ml-0 mb-[10px] transition-all focus-within:ring-2 focus-within:ring-rose-500/60 focus-within:border-rose-500">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              activeSection === 'cards'
                ? 'Search loyalty cards (Esselunga, Conad, Coop...)'
                : 'Search discount vouchers and receipts...'
            }
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden py-2"
          />

          {isFiltered && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg shrink-0 transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!isFiltered && (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 select-none">
              /
            </kbd>
          )}
        </div>

        {/* ONLY Plus Button - Pops up the vertical icon balloon for cards, or opens receipt OCR for discounts */}
        <button
          type="button"
          onClick={() => {
            if (activeSection === 'receipts' && onOpenReceiptOCR) {
              onOpenReceiptOCR();
            } else {
              setIsBalloonOpen(!isBalloonOpen);
            }
          }}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 shrink-0 mb-[10px] ${
            isBalloonOpen
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-45 shadow-slate-900/20'
              : 'bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-rose-600/30'
          }`}
          title={activeSection === 'receipts' ? 'Scan discount receipt' : 'Add card'}
          aria-label={activeSection === 'receipts' ? 'Scan discount receipt' : 'Add card'}
        >
          <Plus className="w-5 h-5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
