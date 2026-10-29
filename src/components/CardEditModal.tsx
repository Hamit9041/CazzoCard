import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Trash2,
  Check,
  Sparkles,
  Download,
  Globe,
} from 'lucide-react';
import { FidelityCard, BarcodeFormat, CardCategory } from '../types/card';
import { POPULAR_BRANDS } from '../data/brandPresets';
import { BARCODE_FORMAT_OPTIONS, formatCardNumberDisplay } from '../utils/barcode';
import { BrandLogo } from './BrandLogo';

interface CardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<FidelityCard, 'id' | 'createdAt' | 'updatedAt'> | FidelityCard) => void;
  editingCard?: FidelityCard | null;
  initialScannedData?: {
    cardNumber: string;
    barcodeFormat: BarcodeFormat;
    cardImage?: string;
    detectedBrandId?: string;
  } | null;
}

const PRESET_COLORS = [
  { color: '#073a26', gradient: '#032014', label: 'Esselunga Green' },
  { color: '#f59c00', gradient: '#d6001c', label: 'Conad Yellow/Red' },
  { color: '#e2001a', gradient: '#990010', label: 'Coop Red' },
  { color: '#1e2229', gradient: '#d90429', label: 'CartaFRECCIA' },
  { color: '#0082c3', gradient: '#005885', label: 'Decathlon Blue' },
  { color: '#0058a3', gradient: '#003566', label: 'IKEA Blue' },
  { color: '#00a3e0', gradient: '#006599', label: 'Acqua & Sapone' },
  { color: '#00805a', gradient: '#e3007f', label: 'Tigotà Green/Pink' },
  { color: '#df0000', gradient: '#8f0000', label: 'MediaWorld' },
  { color: '#002b49', gradient: '#ff6600', label: 'Unieuro' },
  { color: '#1a1a1a', gradient: '#333333', label: 'Classic Black' },
];

export const CardEditModal: React.FC<CardEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCard,
  initialScannedData,
}) => {
  const [storeName, setStoreName] = useState<string>('');
  const [category, setCategory] = useState<CardCategory>('grocery');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('EAN13');
  const [color, setColor] = useState<string>('#073a26');
  const [gradientTo, setGradientTo] = useState<string>('#032014');
  const [frontImage, setFrontImage] = useState<string | undefined>(undefined);
  const [cardDesignUrl, setCardDesignUrl] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [pointsBalance, setPointsBalance] = useState<string>('');
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [showBrandPicker, setShowBrandPicker] = useState<boolean>(false);
  const [internetImageUrl, setInternetImageUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Sync state on open or edits
  useEffect(() => {
    if (editingCard) {
      setStoreName(editingCard.storeName);
      setCategory(editingCard.category);
      setCardNumber(editingCard.cardNumber);
      setBarcodeFormat(editingCard.barcodeFormat);
      setColor(editingCard.color);
      setGradientTo(editingCard.gradientTo || editingCard.color);
      setFrontImage(editingCard.frontImage);
      setCardDesignUrl(editingCard.cardDesignUrl);
      setNotes(editingCard.notes || '');
      setPointsBalance(editingCard.pointsBalance !== undefined ? String(editingCard.pointsBalance) : '');
      setShowBrandPicker(false);
    } else if (initialScannedData) {
      setCardNumber(initialScannedData.cardNumber || '');
      setBarcodeFormat(initialScannedData.barcodeFormat || 'EAN13');
      if (initialScannedData.cardImage) {
        setFrontImage(initialScannedData.cardImage);
      }
      if (initialScannedData.detectedBrandId) {
        const brand = POPULAR_BRANDS.find((b) => b.id === initialScannedData.detectedBrandId);
        if (brand) {
          setStoreName(brand.name);
          setCategory(brand.category);
          setColor(brand.color);
          setGradientTo(brand.gradientTo);
          if (brand.cardDesignUrl) {
            setCardDesignUrl(brand.cardDesignUrl);
          }
        }
      } else {
        setStoreName('');
        setColor(PRESET_COLORS[0].color);
        setGradientTo(PRESET_COLORS[0].gradient);
      }
      setShowBrandPicker(!initialScannedData.detectedBrandId);
    } else {
      setStoreName('');
      setCategory('grocery');
      setCardNumber('');
      setBarcodeFormat('EAN13');
      setColor(PRESET_COLORS[0].color);
      setGradientTo(PRESET_COLORS[0].gradient);
      setFrontImage(undefined);
      setCardDesignUrl(undefined);
      setNotes('');
      setPointsBalance('');
      setShowBrandPicker(true);
    }
  }, [editingCard, initialScannedData, isOpen]);

  const handleSelectBrand = (brand: (typeof POPULAR_BRANDS)[0]) => {
    setStoreName(brand.name);
    setCategory(brand.category);
    setBarcodeFormat(brand.barcodeFormat);
    setColor(brand.color);
    setGradientTo(brand.gradientTo);
    if (brand.cardDesignUrl) {
      setCardDesignUrl(brand.cardDesignUrl);
    }
    setShowBrandPicker(false);
  };

  const matchedBrand = POPULAR_BRANDS.find((b) =>
    storeName.toLowerCase().includes(b.name.toLowerCase().split(' ')[0]) ||
    b.name.toLowerCase().includes(storeName.toLowerCase())
  );

  const handleDownloadCardDesign = () => {
    if (matchedBrand && matchedBrand.cardDesignUrl) {
      setCardDesignUrl(matchedBrand.cardDesignUrl);
      setColor(matchedBrand.color);
      setGradientTo(matchedBrand.gradientTo);
    } else if (internetImageUrl.trim()) {
      setCardDesignUrl(internetImageUrl.trim());
      setShowUrlInput(false);
      setInternetImageUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !cardNumber.trim()) return;

    const payload = {
      storeName: storeName.trim(),
      category,
      cardNumber: cardNumber.trim(),
      barcodeFormat,
      color,
      gradientTo,
      textColor: 'light',
      frontImage,
      cardDesignUrl,
      notes: notes.trim() || undefined,
      pointsBalance: pointsBalance ? Number(pointsBalance) : undefined,
    };

    if (editingCard) {
      onSave({ ...editingCard, ...payload });
    } else {
      onSave(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  const filteredBrands = POPULAR_BRANDS.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const activeBackground = frontImage || cardDesignUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editingCard ? 'Edit Loyalty Card' : 'Add Loyalty Card'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Card appearance and barcode details
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Rectangular Fidelity Card Live Preview */}
          <div
            className="w-full aspect-[1.58/1] rounded-2xl p-4 text-white shadow-xl relative overflow-hidden transition-all duration-300 border border-black/10 dark:border-white/10 flex flex-col justify-between"
            style={{
              background: activeBackground
                ? `url("${activeBackground}") center/cover no-repeat`
                : `linear-gradient(135deg, ${color} 0%, ${gradientTo || color} 100%)`,
              backgroundColor: color,
            }}
          >
            {activeBackground && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30 pointer-events-none" />
            )}

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <BrandLogo
                  storeName={storeName || 'Card'}
                  primaryColor={color}
                  size="md"
                  className="shadow-md"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 text-white drop-shadow-xs block">
                    {category} · Loyalty Card
                  </span>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-md truncate">
                    {storeName || 'Store / Retailer Name'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Barcode display on card */}
            <div className="relative z-10 mt-auto pt-2 border-t border-white/20 backdrop-blur-xs flex items-center justify-between">
              <span className="font-mono text-xs font-semibold tracking-wider text-white drop-shadow-xs">
                {formatCardNumberDisplay(cardNumber) || '•••• •••• ••••'}
              </span>
              <span className="text-[10px] font-mono opacity-80 uppercase text-white drop-shadow-xs">
                {barcodeFormat}
              </span>
            </div>
          </div>

          {/* Download Official Card Design Feature */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Official Card Design
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                {showUrlInput ? 'Close URL' : 'Web Image Link'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Apply the design matching your physical card (Esselunga Fìdaty, Conad, Coop, Trenitalia, Decathlon...) or use official brand colors.
            </p>

            {matchedBrand?.cardDesignUrl && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Official artwork available for {matchedBrand.name}
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCardDesign}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Apply Design
                </button>
              </div>
            )}

            {showUrlInput && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="url"
                  value={internetImageUrl}
                  onChange={(e) => setInternetImageUrl(e.target.value)}
                  placeholder="Paste card image URL (https://...)"
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleDownloadCardDesign}
                  disabled={!internetImageUrl.trim()}
                  className="px-3 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-50 rounded-xl transition-colors shrink-0"
                >
                  Download
                </button>
              </div>
            )}

            {activeBackground && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Card design active</span>
                <button
                  type="button"
                  onClick={() => {
                    setCardDesignUrl(undefined);
                    setFrontImage(undefined);
                  }}
                  className="text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove artwork
                </button>
              </div>
            )}
          </div>

          {/* Quick Brand Preset Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Popular Brands (Rome & Italy)
              </span>
              <button
                type="button"
                onClick={() => setShowBrandPicker(!showBrandPicker)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                {showBrandPicker ? 'Hide List' : 'Browse Stores'}
              </button>
            </div>

            {showBrandPicker && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search store (Esselunga, Conad, Coop, Decathlon...)"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {filteredBrands.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => handleSelectBrand(brand)}
                      className="flex items-center gap-2 p-1.5 rounded-xl text-left bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
                    >
                      <BrandLogo
                        storeName={brand.name}
                        website={brand.website}
                        primaryColor={brand.color}
                        size="sm"
                      />
                      <span className="text-xs font-medium truncate text-slate-800 dark:text-slate-200">
                        {brand.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Store Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store / Retailer Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Esselunga Fìdaty"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CardCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
              >
                <option value="grocery">Supermarket & Grocery</option>
                <option value="retail">Retail & Department Stores</option>
                <option value="pharmacy">Pharmacy & Personal Care</option>
                <option value="travel">Transit & Travel</option>
                <option value="sports">Sports & Outdoor</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="home">Home & Living</option>
                <option value="dining">Coffee & Dining</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Card / Barcode Number *
            </label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="e.g. 0401829482910"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Barcode Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Barcode Symbology
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BARCODE_FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBarcodeFormat(opt.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    barcodeFormat === opt.value
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Color & Theme
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => {
                    setColor(p.color);
                    setGradientTo(p.gradient);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs flex items-center justify-center ${
                    color === p.color ? 'scale-110 border-white dark:border-slate-900 ring-2 ring-rose-500' : 'border-transparent hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${p.color}, ${p.gradient})`,
                  }}
                  title={p.label}
                >
                  {color === p.color && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setGradientTo(e.target.value);
                }}
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent ml-2"
                title="Custom color"
              />
            </div>
          </div>

          {/* Points & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reward Points Balance (Optional)
              </label>
              <input
                type="number"
                value={pointsBalance}
                onChange={(e) => setPointsBalance(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes & Perks (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Free espresso on Wednesdays"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-rose-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!storeName.trim() || !cardNumber.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-colors shadow-md shadow-rose-600/20"
            >
              {editingCard ? 'Save Changes' : 'Save Card to Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
