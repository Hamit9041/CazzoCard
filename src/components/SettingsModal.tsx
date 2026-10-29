import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Share,
  PlusSquare,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ThemePreference } from '../types/card';
import { getBrandfetchClientId, setBrandfetchClientId } from '../utils/brandLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themePreference: ThemePreference;
  onSelectTheme: (pref: ThemePreference) => void;
  isDark: boolean;
  onExportCards: () => void;
  onImportCards: (jsonStr: string) => void;
  onResetCards: () => void;
  totalCardsCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themePreference,
  onSelectTheme,
  isDark,
  onExportCards,
  onImportCards,
  onResetCards,
  totalCardsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [brandfetchId, setBrandfetchId] = useState<string>('');
  const [brandfetchSaved, setBrandfetchSaved] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);

      const ua = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(ua));

      setBrandfetchId(getBrandfetchClientId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportCards(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Wallet Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Installation, theme &amp; backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* iPhone Installation Guide */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone &amp; Mobile Installation</span>
              </label>
              {isStandalone ? (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ✓ Installed App
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  PWA Supported
                </span>
              )}
            </div>

            {isStandalone ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
                <p className="font-semibold mb-1">Running in standalone app mode!</p>
                <p className="opacity-80 leading-relaxed">
                  CazzoCard is running directly from your home screen with offline card access and fullscreen checkout barcodes.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                    1
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold">Open this URL in Safari</span> on your iPhone.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                    2
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    Tap the <strong className="inline-flex items-center gap-1 text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded mx-0.5"><Share className="w-3 h-3" /> Share</strong> button in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                    3
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    Scroll down and tap <strong className="inline-flex items-center gap-1 text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded mx-0.5"><PlusSquare className="w-3 h-3" /> Add to Home Screen</strong> (Aggiungi alla schermata Home), then tap <strong>Add</strong>.
                  </div>
                </div>

                {/* Copy App Link Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Link Copied! Open in iPhone Safari</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link to Open in iPhone Safari</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                App Theme
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {themePreference === 'system'
                  ? `System Auto (${isDark ? 'Dark' : 'Light'})`
                  : themePreference === 'dark'
                  ? 'Dark'
                  : 'Light'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSelectTheme('system')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  themePreference === 'system'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Laptop className="w-5 h-5" />
                <span className="text-xs font-semibold">System</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTheme('light')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  themePreference === 'light'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-semibold">Light</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTheme('dark')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  themePreference === 'dark'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-semibold">Dark</span>
              </button>
            </div>
          </div>

          {/* Brandfetch Logo API Integration */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>Brandfetch Logo API</span>
              </label>
              <a
                href="https://brandfetch.com/developers"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>brandfetch.com/developers</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Logos are automatically fetched via Brandfetch CDN with Google Favicon &amp; monogram fallbacks. If you have a Brandfetch Client ID, paste it below.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={brandfetchId}
                  onChange={(e) => setBrandfetchId(e.target.value)}
                  placeholder="Optional Client ID (e.g. c_...)"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBrandfetchClientId(brandfetchId);
                    setBrandfetchSaved(true);
                    setTimeout(() => setBrandfetchSaved(false), 2000);
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors shrink-0 shadow-xs"
                >
                  {brandfetchSaved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Data &amp; Backup ({totalCardsCount} cards stored)
            </label>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onExportCards}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Export JSON Backup</div>
                    <div className="text-[11px] text-slate-400">Download wallet cards backup</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Import JSON Backup</div>
                    <div className="text-[11px] text-slate-400">Restore cards from JSON file</div>
                  </div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset wallet to default sample cards (Esselunga, Conad, Coop, Decathlon, CartaFRECCIA...)?')) {
                    onResetCards();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 rounded-2xl text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                      Reset to Sample Cards
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Loads Esselunga Fìdaty, Conad, Coop, CartaFRECCIA, Decathlon...
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              All card data and barcode numbers are stored locally on your device in secure browser storage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
