import { useState, useEffect, useCallback } from 'react';
import { DiscountReceipt, BarcodeFormat } from '../types/card';

const RECEIPTS_STORAGE_KEY = 'stocard_discount_receipts_v1';

// Initial sample discount receipts tailored for Rome, Italy (Conad, Esselunga, Coop)
const INITIAL_RECEIPTS: DiscountReceipt[] = [
  {
    id: 'receipt-conad-5euro',
    storeName: 'Conad City Roma',
    discountDescription: '€5.00 discount on your next purchase of at least €30.00',
    amount: '€5.00',
    minSpend: '€30.00',
    // Expiring in 2 days from now
    expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    barcodeNumber: '9920194820192',
    barcodeFormat: 'CODE128',
    notes: 'Printed at checkout at Conad City Roma. Valid at all Conad stores in Lazio.',
    isUsed: false,
    color: '#f59c00',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'receipt-esselunga-10euro',
    storeName: 'Esselunga Fìdaty',
    discountDescription: '€10.00 coupon with minimum spend of €50.00',
    amount: '€10.00',
    minSpend: '€50.00',
    // Expiring in 5 days
    expiryDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    barcodeNumber: '0409820194819',
    barcodeFormat: 'EAN13',
    notes: 'Valid in store and on Esselunga a Casa online grocery.',
    isUsed: false,
    color: '#073a26',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'receipt-coop-fresh',
    storeName: 'Coop Tirreno Roma',
    discountDescription: '20% off entire butcher & fish counter department',
    amount: '20%',
    minSpend: '€20.00',
    // Expiring in 9 days
    expiryDate: new Date(Date.now() + 86400000 * 9).toISOString().slice(0, 10),
    barcodeNumber: '298104820194',
    barcodeFormat: 'CODE128',
    notes: 'Show to cashier with your Carta Socio Coop before payment.',
    isUsed: false,
    color: '#e2001a',
    createdAt: Date.now() - 86400000 * 1,
  },
];

export function useReceipts() {
  const [receipts, setReceipts] = useState<DiscountReceipt[]>(() => {
    try {
      const stored = localStorage.getItem(RECEIPTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse receipts from storage:', e);
    }
    return INITIAL_RECEIPTS;
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
    } catch (e) {
      console.error('Failed to save discount receipts:', e);
    }
  }, [receipts]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        return perm;
      } catch (err) {
        console.warn('Notification permission request error:', err);
      }
    }
    return 'denied';
  }, []);

  // Send an expiry notification if permitted
  const sendExpiryNotification = useCallback((receipt: DiscountReceipt, daysLeft: number) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const urgency = daysLeft === 0 ? 'Expires today!' : `Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`;
        new Notification(`Discount Voucher: ${receipt.storeName} (${urgency})`, {
          body: `${receipt.discountDescription} - Don't forget to use it on your next shopping!`,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Could not fire notification:', err);
      }
    }
  }, []);

  // Check for expiring receipts and send notification on mount
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringVouchers = receipts.filter((r) => {
      if (r.isUsed) return false;
      const exp = new Date(r.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2;
    });

    if (expiringVouchers.length > 0 && notificationPermission === 'granted') {
      const topVoucher = expiringVouchers[0];
      const exp = new Date(topVoucher.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      sendExpiryNotification(topVoucher, daysLeft);
    }
  }, [receipts, notificationPermission, sendExpiryNotification]);

  const addReceipt = useCallback(
    (newReceipt: Omit<DiscountReceipt, 'id' | 'createdAt'>) => {
      const receipt: DiscountReceipt = {
        ...newReceipt,
        id: 'receipt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        createdAt: Date.now(),
      };
      setReceipts((prev) => [receipt, ...prev]);
      return receipt;
    },
    []
  );

  const updateReceipt = useCallback((updated: DiscountReceipt) => {
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  const deleteReceipt = useCallback((id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleUsed = useCallback((id: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isUsed: !r.isUsed } : r))
    );
  }, []);

  return {
    receipts,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    toggleUsed,
    notificationPermission,
    requestNotificationPermission,
  };
}
