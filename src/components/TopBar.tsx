import React from 'react';
import { Settings, Sun, Moon, Laptop, Wallet, Star, Receipt, AlertTriangle, Smartphone } from 'lucide-react';
import { ThemePreference, CardCategory } from '../types/card';

export type MainSection = 'cards' | 'receipts';

interface TopBarProps {
  totalCards: number;
  favoriteCount: number;
  activeFilter: 'all' | 'favorites' | CardCategory;
  onSelectFilter: (filter: 'all' | 'favorites' | CardCategory) => void;
  activeSection: MainSection;
  onSelectSection: (section: MainSection) => void;
  activeReceiptsCount: number;
  expiringVouchersCount: number;
  themePreference: ThemePreference;
  isDark: boolean;
  onCycleTheme: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  totalCards,
  favoriteCount,
  activeFilter,
  onSelectFilter,
  activeSection,
  onSelectSection,
  activeReceiptsCount,
  expiringVouchersCount,
  themePreference,
  isDark,
  onCycleTheme,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Row 1: Brand Wordmark + Actions (Mobile & Desktop) */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Wordmark: CazzoCard */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onSelectSection('cards');
                onSelectFilter('all');
              }}
              className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap truncate"
            >
              CazzoCard
            </a>

            {/* Desktop Section Switcher (Side by side on md+ screens) */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold ml-3">
              <button
                type="button"
                onClick={() => onSelectSection('cards')}
                className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeSection === 'cards'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Cards</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700">
                  {totalCards}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectSection('receipts')}
                className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeSection === 'receipts'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Discounts</span>
                {expiringVouchersCount > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold animate-pulse flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{expiringVouchersCount}</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700">
                    {activeReceiptsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Filter Navigation Tabs */}
          {activeSection === 'cards' && (
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto text-xs font-semibold py-1">
              <button
                type="button"
                onClick={() => onSelectFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                All
              </button>

              {favoriteCount > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectFilter('favorites')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeFilter === 'favorites'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Favs</span>
                </button>
              )}

              {(['grocery', 'retail', 'travel', 'sports'] as CardCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectFilter(cat)}
                  className={`px-2.5 py-1.5 rounded-xl capitalize transition-all whitespace-nowrap ${
                    activeFilter === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          )}

          {/* Right Action Icons: Install, Theme & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
              title="Install app on iPhone / Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              type="button"
              onClick={onCycleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              title={`Theme: ${themePreference}. Click to cycle (Auto / Light / Dark).`}
              aria-label="Toggle theme"
            >
              {themePreference === 'system' ? (
                <Laptop className="w-4 h-4 text-slate-500" />
              ) : isDark ? (
                <Moon className="w-4 h-4 text-amber-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="Wallet Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Mobile Section Tab Switcher (Placed directly under the name row) */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectSection('cards')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeSection === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span>Cards</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700">
                {totalCards}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSection('receipts')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeSection === 'receipts'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 shrink-0" />
              <span>Discounts</span>
              {expiringVouchersCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold animate-pulse flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{expiringVouchersCount}</span>
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700">
                  {activeReceiptsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
