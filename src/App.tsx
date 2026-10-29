import React, { useState, useMemo } from 'react';
import { useCards } from './hooks/useCards';
import { useTheme } from './hooks/useTheme';
import { useReceipts } from './hooks/useReceipts';
import { FidelityCard, CardCategory, BarcodeFormat, DiscountReceipt } from './types/card';
import { fuzzySearchCards } from './utils/fuzzySearch';
import { TopBar, MainSection } from './components/TopBar';
import { CardGrid } from './components/CardGrid';
import { ReceiptsSection } from './components/ReceiptsSection';
import { BottomSearchBar } from './components/BottomSearchBar';
import { CameraScannerModal, CardScanResult } from './components/CameraScannerModal';
import { ReceiptOCRModal } from './components/ReceiptOCRModal';
import { CardDetailModal } from './components/CardDetailModal';
import { CardEditModal } from './components/CardEditModal';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const {
    cards,
    addCard,
    updateCard,
    deleteCard,
    toggleFavorite,
    recordCardUsage,
    resetToSampleCards,
    exportCardsJson,
    importCardsJson,
  } = useCards();

  const {
    receipts,
    addReceipt,
    deleteReceipt,
    toggleUsed,
    notificationPermission,
    requestNotificationPermission,
  } = useReceipts();

  const { themePreference, setThemePreference, isDark } = useTheme();

  // Main Section Navigation (Cards vs Discounts & Receipts)
  const [activeSection, setActiveSection] = useState<MainSection>('cards');

  // Search and Category filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'all' | 'favorites' | CardCategory
  >('all');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isReceiptOCRModalOpen, setIsReceiptOCRModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<FidelityCard | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Scanned data passed to edit modal when manual fine-tuning is needed
  const [scannedData, setScannedData] = useState<{
    cardNumber: string;
    barcodeFormat: BarcodeFormat;
    cardImage?: string;
    detectedBrandId?: string;
  } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Selected card for detail modal
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return cards.find((c) => c.id === selectedCardId) || null;
  }, [cards, selectedCardId]);

  // Counts
  const favoriteCount = useMemo(() => cards.filter((c) => c.favorite).length, [cards]);

  // Expiring discount vouchers count (<= 3 days)
  const expiringVouchersCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return receipts.filter((r) => {
      if (r.isUsed) return false;
      const exp = new Date(r.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    }).length;
  }, [receipts]);

  // Filtered & Fuzzy Searched cards in Alphabetical Order
  const displayedCards = useMemo(() => {
    let baseList = cards;
    if (activeCategoryFilter === 'favorites') {
      baseList = cards.filter((c) => c.favorite);
    } else if (activeCategoryFilter !== 'all') {
      baseList = cards.filter((c) => c.category === activeCategoryFilter);
    }

    if (!searchQuery.trim()) {
      return baseList;
    }
    return fuzzySearchCards(baseList, searchQuery);
  }, [cards, activeCategoryFilter, searchQuery]);

  // Filtered discount receipts based on search query
  const displayedReceipts = useMemo(() => {
    if (!searchQuery.trim()) return receipts;
    const q = searchQuery.toLowerCase();
    return receipts.filter(
      (r) =>
        r.storeName.toLowerCase().includes(q) ||
        r.discountDescription.toLowerCase().includes(q) ||
        (r.amount && r.amount.toLowerCase().includes(q))
    );
  }, [receipts, searchQuery]);

  // Cycle theme: system -> light -> dark -> system
  const handleCycleTheme = () => {
    if (themePreference === 'system') setThemePreference('light');
    else if (themePreference === 'light') setThemePreference('dark');
    else setThemePreference('system');
  };

  // Handle whole-card automatically detected from Camera Scanner
  const handleCardDetected = (result: CardScanResult) => {
    setIsScannerOpen(false);

    // Directly create entry without forcing manual insert!
    const created = addCard({
      storeName: result.storeName,
      category: result.category,
      cardNumber: result.cardNumber,
      barcodeFormat: result.barcodeFormat,
      color: result.color,
      gradientTo: result.gradientTo,
      cardDesignUrl: result.cardDesignUrl,
      frontImage: result.cardImage,
      favorite: false,
    });

    setSelectedCardId(created.id);
    showToast(`Added ${result.storeName} card to wallet!`, 'success');
  };

  // Open empty Add Card modal
  const handleAddNewCard = () => {
    setEditingCard(null);
    setScannedData(null);
    setIsEditModalOpen(true);
  };

  // Handle Card save
  const handleSaveCard = (cardData: Omit<FidelityCard, 'id' | 'createdAt' | 'updatedAt'> | FidelityCard) => {
    if ('id' in cardData) {
      updateCard(cardData);
      showToast('Card updated', 'success');
    } else {
      const created = addCard(cardData);
      showToast('Card added to wallet', 'success');
      setSelectedCardId(created.id);
    }
    setScannedData(null);
    setEditingCard(null);
  };

  // Handle Receipt Save from OCR Modal
  const handleSaveReceipt = (receiptData: Omit<DiscountReceipt, 'id' | 'createdAt'>) => {
    addReceipt(receiptData);
    showToast('Discount voucher saved to wallet!', 'success');
  };

  // Handle Card Import from JSON
  const handleImportJson = (jsonStr: string) => {
    const res = importCardsJson(jsonStr);
    if (res.success) {
      showToast(`Imported ${res.count} cards successfully!`, 'success');
    } else {
      showToast(res.error || 'Failed to import cards', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar with Section Switcher & Theme Control */}
      <TopBar
        totalCards={cards.length}
        favoriteCount={favoriteCount}
        activeFilter={activeCategoryFilter}
        onSelectFilter={setActiveCategoryFilter}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        activeReceiptsCount={receipts.filter((r) => !r.isUsed).length}
        expiringVouchersCount={expiringVouchersCount}
        themePreference={themePreference}
        isDark={isDark}
        onCycleTheme={handleCycleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 pb-28">
        {/* Section 1: Fidelity Cards */}
        {activeSection === 'cards' && (
          <>
            {/* Mobile Filter Carousel */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  activeCategoryFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                All ({cards.length})
              </button>
              {favoriteCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('favorites')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    activeCategoryFilter === 'favorites'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Favorites ({favoriteCount})
                </button>
              )}
              {(['grocery', 'retail', 'pharmacy', 'travel', 'sports', 'fashion'] as CardCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl capitalize whitespace-nowrap transition-colors ${
                      activeCategoryFilter === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Rectangular Grid View with Multi-Solid Colors */}
            <CardGrid
              cards={displayedCards}
              onSelectCard={(card) => {
                recordCardUsage(card.id);
                setSelectedCardId(card.id);
              }}
              onToggleFavorite={toggleFavorite}
              onAddNewCard={handleAddNewCard}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          </>
        )}

        {/* Section 2: Discount Receipts & Vouchers */}
        {activeSection === 'receipts' && (
          <ReceiptsSection
            receipts={displayedReceipts}
            onAddReceipt={() => setIsReceiptOCRModalOpen(true)}
            onToggleUsed={toggleUsed}
            onDeleteReceipt={(id) => {
              deleteReceipt(id);
              showToast('Discount receipt removed', 'info');
            }}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={async () => {
              const res = await requestNotificationPermission();
              if (res === 'granted') {
                showToast('Expiry notifications enabled!', 'success');
              } else {
                showToast('Notification permission not granted', 'info');
              }
            }}
          />
        )}
      </main>

      {/* Bottom Ergonomic Fuzzy Search Bar with only Plus Button and Vertical Balloon */}
      <BottomSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        onOpenManualInsert={handleAddNewCard}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenReceiptOCR={() => setIsReceiptOCRModalOpen(true)}
        activeSection={activeSection}
        totalCardsCount={cards.length}
        filteredCount={activeSection === 'cards' ? displayedCards.length : displayedReceipts.length}
      />

      {/* Whole-Card Camera Scanner Modal (Recognizes brand, barcode, and colors simultaneously) */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCardDetected={handleCardDetected}
      />

      {/* Receipt OCR Modal for Discount Slips */}
      <ReceiptOCRModal
        isOpen={isReceiptOCRModalOpen}
        onClose={() => setIsReceiptOCRModalOpen(false)}
        onSaveReceipt={handleSaveReceipt}
      />

      {/* Card Details & Fullscreen Cashier View Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={Boolean(selectedCardId)}
        onClose={() => setSelectedCardId(null)}
        onEdit={(card) => {
          setEditingCard(card);
          setSelectedCardId(null);
          setIsEditModalOpen(true);
        }}
        onDelete={(id) => {
          deleteCard(id);
          setSelectedCardId(null);
          showToast('Card removed from wallet', 'info');
        }}
        onToggleFavorite={toggleFavorite}
        onUpdatePoints={(card, newPoints) => {
          updateCard({ ...card, pointsBalance: newPoints });
        }}
      />

      {/* Card Add / Edit Modal (Manual Entry) */}
      <CardEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCard(null);
          setScannedData(null);
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
        initialScannedData={scannedData}
      />

      {/* Settings & Theme Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themePreference={themePreference}
        onSelectTheme={setThemePreference}
        isDark={isDark}
        onExportCards={exportCardsJson}
        onImportCards={handleImportJson}
        onResetCards={() => {
          resetToSampleCards();
          showToast('Reset wallet to default sample cards', 'info');
        }}
        totalCardsCount={cards.length}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-white" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
