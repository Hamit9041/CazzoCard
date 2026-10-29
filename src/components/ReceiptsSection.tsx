import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Bell,
  BellRing,
  ExternalLink,
  Barcode as BarcodeIcon,
  Maximize2,
  Scissors,
  Check,
} from 'lucide-react';
import { DiscountReceipt } from '../types/card';
import { BarcodeRenderer } from './BarcodeRenderer';
import { BrandLogo } from './BrandLogo';

interface ReceiptsSectionProps {
  receipts: DiscountReceipt[];
  onAddReceipt: () => void;
  onToggleUsed: (id: string) => void;
  onDeleteReceipt: (id: string) => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
}

export const ReceiptsSection: React.FC<ReceiptsSectionProps> = ({
  receipts,
  onAddReceipt,
  onToggleUsed,
  onDeleteReceipt,
  notificationPermission,
  onRequestNotificationPermission,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'used'>('active');
  const [selectedVoucherForBarcode, setSelectedVoucherForBarcode] = useState<DiscountReceipt | null>(null);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Compute days remaining and status for each receipt
  const receiptsWithStatus = useMemo(() => {
    return receipts.map((r) => {
      const exp = new Date(r.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffMs = exp.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = daysLeft < 0;
      const isExpiringSoon = !r.isUsed && daysLeft >= 0 && daysLeft <= 3;
      return {
        ...r,
        daysLeft,
        isExpired,
        isExpiringSoon,
      };
    });
  }, [receipts, today]);

  // Urgent expiring count
  const expiringSoonCount = useMemo(() => {
    return receiptsWithStatus.filter((r) => r.isExpiringSoon).length;
  }, [receiptsWithStatus]);

  // Filtered list
  const filteredReceipts = useMemo(() => {
    switch (filter) {
      case 'active':
        return receiptsWithStatus.filter((r) => !r.isUsed && !r.isExpired);
      case 'expiring':
        return receiptsWithStatus.filter((r) => r.isExpiringSoon);
      case 'used':
        return receiptsWithStatus.filter((r) => r.isUsed || r.isExpired);
      case 'all':
      default:
        return receiptsWithStatus;
    }
  }, [receiptsWithStatus, filter]);

  return (
    <div className="space-y-6">
      {/* Top Expiry Warning & Notification Banner */}
      {expiringSoonCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                {expiringSoonCount} Discount Voucher{expiringSoonCount > 1 ? 's' : ''} Expiring Soon!
              </h4>
              <p className="text-xs opacity-85">
                Use your discounts on your next supermarket trip to avoid losing them.
              </p>
            </div>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={onRequestNotificationPermission}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Expiry Alerts</span>
            </button>
          )}
        </div>
      )}

      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Discount Receipts &amp; Vouchers</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              {receipts.filter((r) => !r.isUsed).length} active
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            OCR-scanned next-shopping receipts, store coupons &amp; expiration reminders
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              filter === 'active'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Active ({receiptsWithStatus.filter((r) => !r.isUsed && !r.isExpired).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('expiring')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ${
              filter === 'expiring'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>Expiring ({expiringSoonCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('used')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              filter === 'used'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Used / Expired
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All ({receipts.length})
          </button>
        </div>
      </div>

      {/* Receipts Grid */}
      {filteredReceipts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No discount receipts in this view
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Scan your supermarket discount slips with the camera to keep track of expiration dates and barcodes.
          </p>
          <button
            type="button"
            onClick={onAddReceipt}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Scan Discount Receipt</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReceipts.map((voucher) => {
            const isInactive = voucher.isUsed || voucher.isExpired;

            return (
              <div
                key={voucher.id}
                className={`relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${
                  isInactive ? 'opacity-65' : ''
                }`}
              >
                {/* Top Voucher Banner */}
                <div
                  className="px-5 py-3.5 flex items-start justify-between gap-3 text-white"
                  style={{
                    backgroundColor: voucher.color || '#0b5336',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <BrandLogo
                      storeName={voucher.storeName}
                      primaryColor={voucher.color || '#0b5336'}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 block truncate">
                        DISCOUNT VOUCHER
                      </span>
                      <h3 className="text-base font-bold tracking-tight truncate">
                        {voucher.storeName}
                      </h3>
                    </div>
                  </div>

                  {/* Expiry Pill */}
                  <div className="shrink-0">
                    {voucher.isUsed ? (
                      <span className="px-2.5 py-1 rounded-full bg-black/40 text-[10px] font-bold text-white/90 backdrop-blur-xs flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Used</span>
                      </span>
                    ) : voucher.isExpired ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                        Expired
                      </span>
                    ) : voucher.daysLeft === 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                        Expiring Today!
                      </span>
                    ) : voucher.daysLeft <= 3 ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 shadow-xs">
                        {voucher.daysLeft} Day{voucher.daysLeft > 1 ? 's' : ''} Left!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                        {voucher.daysLeft} Days Left
                      </span>
                    )}
                  </div>
                </div>

                {/* Voucher Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Discount Value Highlight */}
                    <div className="flex items-baseline gap-2 mb-1">
                      {voucher.amount && (
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                          {voucher.amount}
                        </span>
                      )}
                      {voucher.minSpend && (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          Min spend: {voucher.minSpend}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {voucher.discountDescription}
                    </p>

                    {/* Expiry Info */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Valid until: {voucher.expiryDate}</span>
                    </div>

                    {voucher.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        {voucher.notes}
                      </p>
                    )}
                  </div>

                  {/* Perforated Scissor Cut Line */}
                  <div className="relative py-2 flex items-center">
                    <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                    <div className="px-2 text-slate-400 text-[10px] font-mono flex items-center gap-1">
                      <Scissors className="w-3 h-3 rotate-90" />
                      <span>CASHIER BARCODE</span>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                  </div>

                  {/* Barcode Section for Checkout Redemption */}
                  {voucher.barcodeNumber ? (
                    <div
                      onClick={() => setSelectedVoucherForBarcode(voucher)}
                      className="cursor-pointer bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors flex flex-col items-center group"
                      title="Tap to enlarge for cashier scan"
                    >
                      <BarcodeRenderer
                        value={voucher.barcodeNumber}
                        format={voucher.barcodeFormat || 'CODE128'}
                        height={55}
                        widthScale={1.6}
                      />
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-500">
                        <span>{voucher.barcodeNumber}</span>
                        <Maximize2 className="w-3 h-3 opacity-60" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                      Show receipt or mention promotion to cashier at checkout
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => onToggleUsed(voucher.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                        voucher.isUsed
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{voucher.isUsed ? 'Mark as Active' : 'Mark as Used'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteReceipt(voucher.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                      title="Delete voucher"
                      aria-label="Delete voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Barcode Modal for Cashier Gun Scanning */}
      {selectedVoucherForBarcode && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-slate-900 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {selectedVoucherForBarcode.storeName}
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">
                  {selectedVoucherForBarcode.amount || 'Discount'} · Valid until {selectedVoucherForBarcode.expiryDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedVoucherForBarcode(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="w-full bg-white p-4 border border-slate-200 rounded-2xl flex flex-col items-center shadow-inner my-2">
              <BarcodeRenderer
                value={selectedVoucherForBarcode.barcodeNumber || ''}
                format={selectedVoucherForBarcode.barcodeFormat || 'CODE128'}
                height={120}
                widthScale={2.2}
              />
              <span className="font-mono text-base font-bold mt-3 tracking-wider">
                {selectedVoucherForBarcode.barcodeNumber}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Hold screen toward checkout barcode scanner
            </p>

            <button
              onClick={() => setSelectedVoucherForBarcode(null)}
              className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
