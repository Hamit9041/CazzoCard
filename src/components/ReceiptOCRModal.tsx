import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Upload, Sparkles, RefreshCw, Check, AlertCircle, Calendar, Tag, DollarSign, Barcode as BarcodeIcon } from 'lucide-react';
import { DiscountReceipt, BarcodeFormat } from '../types/card';
import { BarcodeRenderer } from './BarcodeRenderer';

interface ReceiptOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReceipt: (receipt: Omit<DiscountReceipt, 'id' | 'createdAt'>) => void;
}

export const ReceiptOCRModal: React.FC<ReceiptOCRModalProps> = ({
  isOpen,
  onClose,
  onSaveReceipt,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Form states after OCR
  const [storeName, setStoreName] = useState<string>('');
  const [discountDescription, setDiscountDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [minSpend, setMinSpend] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [barcodeNumber, setBarcodeNumber] = useState<string>('');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<'capture' | 'review'>('capture');

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setOcrError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera failed:', err);
      setCameraError('Camera unavailable. You can upload a receipt photo instead.');
      setCameraActive(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (isOpen) {
      setStep('capture');
      setStoreName('');
      setDiscountDescription('');
      setAmount('');
      setMinSpend('');
      setExpiryDate('');
      setBarcodeNumber('');
      setNotes('');
      setReceiptImage(undefined);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Capture frame from video
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.warn('Capture error:', e);
    }
    return null;
  };

  // Perform Gemini OCR
  const runOCR = async (imageBase64: string) => {
    setIsProcessing(true);
    setOcrError(null);
    setReceiptImage(imageBase64);

    try {
      const res = await fetch('/api/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!res.ok) {
        throw new Error('OCR recognition failed');
      }

      const data = await res.json();
      setStoreName(data.storeName || 'Supermarket Discount');
      setDiscountDescription(data.discountDescription || 'Discount voucher on next shopping');
      setAmount(data.amount || '');
      setMinSpend(data.minSpend || '');

      // Ensure valid future expiry date
      let exp = data.expiryDate;
      if (!exp || !/^\d{4}-\d{2}-\d{2}$/.test(exp)) {
        // default 7 days from now
        exp = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
      }
      setExpiryDate(exp);

      setBarcodeNumber(data.barcodeNumber || '');
      setBarcodeFormat((data.barcodeFormat as BarcodeFormat) || 'CODE128');
      setNotes(data.notes || '');

      stopCamera();
      setStep('review');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setOcrError('Failed to read receipt text. You can fill the details manually below.');
      stopCamera();
      setStep('review');
      // Set sensible defaults
      setExpiryDate(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptureClick = () => {
    const frame = captureFrame();
    if (frame) {
      runOCR(frame);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (base64) {
        runOCR(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick preset test for convenience
  const applyPresetTest = (preset: 'conad' | 'esselunga' | 'coop') => {
    if (preset === 'conad') {
      setStoreName('Conad Superstore');
      setDiscountDescription('€5.00 off next purchase of at least €30.00');
      setAmount('€5.00');
      setMinSpend('€30.00');
      setExpiryDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
      setBarcodeNumber('9820491028491');
      setBarcodeFormat('CODE128');
      setNotes('Valid at all Conad stores in Rome');
    } else if (preset === 'esselunga') {
      setStoreName('Esselunga Fìdaty');
      setDiscountDescription('€8.00 discount on entire fresh meat department');
      setAmount('€8.00');
      setMinSpend('€25.00');
      setExpiryDate(new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10));
      setBarcodeNumber('0409820194829');
      setBarcodeFormat('EAN13');
      setNotes('Show with your Fìdaty card at checkout');
    } else {
      setStoreName('Coop Tirreno');
      setDiscountDescription('15% off next shopping cart');
      setAmount('15%');
      setMinSpend('€15.00');
      setExpiryDate(new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 10));
      setBarcodeNumber('298104829104');
      setBarcodeFormat('CODE128');
      setNotes('Exclusive to Coop Socio members');
    }
    stopCamera();
    setStep('review');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !expiryDate) return;

    onSaveReceipt({
      storeName: storeName.trim(),
      discountDescription: discountDescription.trim() || 'Shopping Discount',
      amount: amount.trim() || undefined,
      minSpend: minSpend.trim() || undefined,
      expiryDate,
      barcodeNumber: barcodeNumber.trim() || undefined,
      barcodeFormat,
      notes: notes.trim() || undefined,
      receiptImage,
      isUsed: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Discount Receipt OCR</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'capture' ? 'Scan receipt / coupon slip' : 'Verify extracted metadata'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Capture or Upload Receipt */}
        {step === 'capture' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="relative w-full aspect-[3/4] bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Receipt Viewfinder Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-full max-w-[260px] h-[340px] border-2 border-dashed border-emerald-400/90 rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.3)] flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                      Receipt Top
                    </span>
                  </div>
                  <div className="text-center opacity-60">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                      Align Discount Slip
                    </p>
                    <p className="text-[9px] text-slate-300">Amount · Barcode · Expiry Date</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                      Barcode Area
                    </span>
                  </div>
                </div>
              </div>

              {/* Capture Button */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleCaptureClick}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-xl flex items-center gap-2 backdrop-blur-md transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reading Receipt OCR...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Capture & Extract Info</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions & Presets */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload receipt picture</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Demo:</span>
                  <button
                    type="button"
                    onClick={() => applyPresetTest('conad')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium"
                  >
                    Conad €5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTest('esselunga')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium"
                  >
                    Esselunga €8
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review and Save OCR Metadata */}
        {step === 'review' && (
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
            {ocrError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{ocrError}</span>
              </div>
            )}

            {/* Store Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Store / Retailer Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Conad, Esselunga, Coop"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* Discount Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Discount Offer Summary *
              </label>
              <input
                type="text"
                required
                value={discountDescription}
                onChange={(e) => setDiscountDescription(e.target.value)}
                placeholder="e.g. €5 off next purchase over €30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Amount & Min Spend Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Discount Value
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="€5.00 or 20%"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Min Spend
                </label>
                <input
                  type="text"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="e.g. €30.00"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Expiry Date (Crucial for notification) */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Expiration Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                You will receive a notification before this voucher expires.
              </p>
            </div>

            {/* Barcode Number for Cashier Scanning */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BarcodeIcon className="w-3.5 h-3.5" />
                Voucher Barcode / Promo Code
              </label>
              <input
                type="text"
                value={barcodeNumber}
                onChange={(e) => setBarcodeNumber(e.target.value)}
                placeholder="Barcode digits on receipt"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />

              {barcodeNumber.trim() && (
                <div className="mt-2.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <BarcodeRenderer
                    value={barcodeNumber}
                    format={barcodeFormat}
                    height={60}
                    widthScale={1.8}
                  />
                  <span className="font-mono text-xs font-semibold mt-1 text-slate-600 dark:text-slate-400">
                    {barcodeNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Terms & Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Valid only on next purchase with fidelity card"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('capture');
                  startCamera();
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Scan Again
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Discount Voucher</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
