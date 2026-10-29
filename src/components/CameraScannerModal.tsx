import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, SwitchCamera, Zap, ZapOff, Check, AlertCircle, Sparkles, RefreshCw, Upload } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat as ZXingBarcodeFormat } from '@zxing/library';
import { BarcodeFormat, CardCategory, FidelityCard } from '../types/card';
import { POPULAR_BRANDS } from '../data/brandPresets';

export interface CardScanResult {
  storeName: string;
  cardNumber: string;
  barcodeFormat: BarcodeFormat;
  color: string;
  gradientTo?: string;
  category: CardCategory;
  cardDesignUrl?: string;
  cardImage?: string;
}

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardDetected: (result: CardScanResult) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onCardDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const isDetectedRef = useRef<boolean>(false);
  const isAnalyzingRef = useRef<boolean>(false);
  const aiScanIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Hold entire card inside the frame...');
  const [detectedSuccess, setDetectedSuccess] = useState<CardScanResult | null>(null);

  // Stop camera and scanner routines
  const stopCamera = useCallback(() => {
    isDetectedRef.current = true;
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {
        // ignore
      }
      controlsRef.current = null;
    }
    if (aiScanIntervalRef.current) {
      clearInterval(aiScanIntervalRef.current);
      aiScanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
    setIsAnalyzing(false);
  }, []);

  // Take high quality snapshot from video feed
  const captureFrameBase64 = useCallback((): string | null => {
    if (!videoRef.current) return null;
    try {
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.85);
        }
      }
    } catch (e) {
      console.warn('Frame capture error:', e);
    }
    return null;
  }, []);

  // Try matching detected store name with brand presets to get authentic card design if available
  const matchOfficialBrand = useCallback((storeName: string) => {
    const query = storeName.toLowerCase().trim();
    return POPULAR_BRANDS.find((brand) => {
      const name = brand.name.toLowerCase();
      const id = brand.id.toLowerCase();
      return query.includes(brand.name.toLowerCase().split(' ')[0]) ||
             name.includes(query) ||
             id.includes(query);
    });
  }, []);

  // Dispatch full card detection to parent
  const handleFinalSuccess = useCallback(
    (result: CardScanResult) => {
      if (isDetectedRef.current) return;
      isDetectedRef.current = true;
      stopCamera();

      // Haptic feedback if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([70, 50, 100]);
        } catch {
          // ignore
        }
      }

      setDetectedSuccess(result);
      setTimeout(() => {
        onCardDetected(result);
      }, 500);
    },
    [onCardDetected, stopCamera]
  );

  // Analyze whole card via Gemini server endpoint
  const analyzeWholeCardImage = useCallback(
    async (imageBase64: string, knownBarcode?: { code: string; format: BarcodeFormat }) => {
      if (isDetectedRef.current || isAnalyzingRef.current) return;
      isAnalyzingRef.current = true;
      setIsAnalyzing(true);
      setStatusMessage('Recognizing whole card brand & barcode...');

      try {
        const res = await fetch('/api/scan-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        });

        if (!res.ok) {
          throw new Error('Whole card analysis failed');
        }

        const data = await res.json();
        const storeName = data.storeName || (knownBarcode ? 'Loyalty Card' : '');
        const cardNumber = data.cardNumber || knownBarcode?.code || '';
        const barcodeFormat: BarcodeFormat =
          (data.barcodeFormat as BarcodeFormat) || knownBarcode?.format || 'EAN13';

        if (storeName && cardNumber) {
          // Check if an official design is available from Italian brand presets
          const brandMatch = matchOfficialBrand(storeName);

          const finalResult: CardScanResult = {
            storeName: brandMatch ? brandMatch.name : storeName,
            cardNumber: cardNumber.replace(/\s+/g, ''),
            barcodeFormat: brandMatch ? brandMatch.barcodeFormat : barcodeFormat,
            color: brandMatch ? brandMatch.color : (data.primaryColor || '#f59c00'),
            gradientTo: brandMatch ? brandMatch.gradientTo : (data.secondaryColor || '#d6001c'),
            category: brandMatch ? brandMatch.category : ((data.category as CardCategory) || 'grocery'),
            cardDesignUrl: brandMatch?.cardDesignUrl, // Only if official design exists; otherwise solid colors!
            cardImage: imageBase64,
          };

          handleFinalSuccess(finalResult);
          return;
        }
      } catch (err) {
        console.warn('AI Whole card analysis error:', err);
      } finally {
        isAnalyzingRef.current = false;
        setIsAnalyzing(false);
        if (!isDetectedRef.current) {
          setStatusMessage('Hold entire card inside the frame...');
        }
      }
    },
    [handleFinalSuccess, matchOfficialBrand]
  );

  // Start live camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setDetectedSuccess(null);
    isDetectedRef.current = false;
    isAnalyzingRef.current = false;
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        const videoEl = videoRef.current;
        videoEl.srcObject = stream;
        await videoEl.play();
        setCameraActive(true);
        isDetectedRef.current = false;

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        if (track && 'getCapabilities' in track) {
          const capabilities = (track as any).getCapabilities?.();
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        }

        // 1. Continuous ZXing Barcode Decoder
        try {
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            ZXingBarcodeFormat.EAN_13,
            ZXingBarcodeFormat.EAN_8,
            ZXingBarcodeFormat.CODE_128,
            ZXingBarcodeFormat.UPC_A,
            ZXingBarcodeFormat.QR_CODE,
            ZXingBarcodeFormat.CODE_39,
          ]);
          hints.set(DecodeHintType.TRY_HARDER, true);

          const codeReader = new BrowserMultiFormatReader(hints, {
            delayBetweenScanAttempts: 150,
          });

          codeReader.decodeFromVideoElement(videoEl, (result) => {
            if (result && !isDetectedRef.current && !isAnalyzingRef.current) {
              const text = result.getText()?.trim();
              if (text) {
                const zFmt = String(result.getBarcodeFormat()).toUpperCase();
                let fmt: BarcodeFormat = 'CODE128';
                if (zFmt.includes('EAN_13')) fmt = 'EAN13';
                else if (zFmt.includes('EAN_8')) fmt = 'EAN8';
                else if (zFmt.includes('QR')) fmt = 'QR_CODE';
                else if (zFmt.includes('UPC')) fmt = 'UPC';
                else if (zFmt.includes('CODE_39')) fmt = 'CODE39';

                // We have the barcode number! Take the whole card snapshot to detect brand & colors
                const snapshot = captureFrameBase64();
                if (snapshot) {
                  analyzeWholeCardImage(snapshot, { code: text, format: fmt });
                }
              }
            }
          }).then((ctrls) => {
            controlsRef.current = ctrls;
          }).catch((e) => console.warn('ZXing error:', e));
        } catch (zxErr) {
          console.warn('ZXing init error:', zxErr);
        }

        // 2. Automated Whole-Card Scanner Interval (AI Vision every ~2s)
        aiScanIntervalRef.current = setInterval(() => {
          if (isDetectedRef.current || isAnalyzingRef.current || !videoEl || videoEl.readyState < 2) return;
          const snapshot = captureFrameBase64();
          if (snapshot) {
            analyzeWholeCardImage(snapshot);
          }
        }, 2200);
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device.';
      }
      setCameraError(message);
      setCameraActive(false);
    }
  }, [analyzeWholeCardImage, captureFrameBase64, facingMode, stopCamera]);

  // Torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const next = !torchOn;
        await (track as any).applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  // Switch camera facing mode
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Immediate manual snapshot scan button
  const handleManualSnap = () => {
    const snap = captureFrameBase64();
    if (snap) {
      analyzeWholeCardImage(snap);
    }
  };

  // Handle image upload from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (base64) {
        analyzeWholeCardImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Whole-Card Auto Scan</h2>
              <p className="text-xs text-slate-400">Recognizes brand, barcode & colors</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Video Viewport */}
        <div className="relative w-full aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
          />

          {/* Whole-Card Aspect Ratio Reticle (1.58:1 Standard ID-1 Card) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            <div
              className={`relative w-full max-w-[310px] aspect-[1.58/1] rounded-2xl transition-all duration-300 border-2 ${
                detectedSuccess
                  ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                  : isAnalyzing
                  ? 'border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                  : 'border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }`}
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-rose-500 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-rose-500 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-rose-500 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-rose-500 rounded-br-xl" />

              {/* Scanning visual overlay */}
              {!detectedSuccess && (
                <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-pulse" />
              )}

              {/* Target watermark text */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <span className="text-[11px] font-bold tracking-widest uppercase text-white">
                  Frame Entire Loyalty Card
                </span>
              </div>

              {/* Success pill */}
              {detectedSuccess && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 backdrop-blur-xs rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mb-2 shadow-lg">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div className="font-bold text-base text-white">{detectedSuccess.storeName}</div>
                  <div className="font-mono text-xs text-emerald-300 mt-0.5">
                    {detectedSuccess.cardNumber}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Controls: Torch & Camera flip */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-auto">
            {hasTorch ? (
              <button
                type="button"
                onClick={toggleTorch}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                  torchOn ? 'bg-amber-400 text-slate-900' : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                aria-label="Flashlight"
              >
                {torchOn ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* Instant Snap Trigger Button */}
            <button
              type="button"
              onClick={handleManualSnap}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={flipCamera}
              className="w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-md transition-colors"
              aria-label="Flip camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer with status and quick triggers */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-center space-y-3">
          {cameraError ? (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <p className="leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span className="text-amber-300">{statusMessage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>{statusMessage}</span>
                </>
              )}
            </div>
          )}

          {/* Upload card photo option & Instant preset testing */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            {/* Upload image fallback */}
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
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload photo</span>
            </button>

            {/* Quick Demo Test Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Test:</span>
              <button
                type="button"
                onClick={() => {
                  const brand = POPULAR_BRANDS.find((b) => b.id === 'conad-insieme')!;
                  handleFinalSuccess({
                    storeName: brand.name,
                    cardNumber: '2401829481029',
                    barcodeFormat: brand.barcodeFormat,
                    color: brand.color,
                    gradientTo: brand.gradientTo,
                    category: brand.category,
                    cardDesignUrl: brand.cardDesignUrl,
                  });
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
              >
                Conad
              </button>
              <button
                type="button"
                onClick={() => {
                  const brand = POPULAR_BRANDS.find((b) => b.id === 'esselunga-fidaty')!;
                  handleFinalSuccess({
                    storeName: brand.name,
                    cardNumber: '0401829482910',
                    barcodeFormat: brand.barcodeFormat,
                    color: brand.color,
                    gradientTo: brand.gradientTo,
                    category: brand.category,
                    cardDesignUrl: brand.cardDesignUrl,
                  });
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
              >
                Esselunga
              </button>
              <button
                type="button"
                onClick={() => {
                  // Unknown card without official design: tests solid colors fallback
                  handleFinalSuccess({
                    storeName: 'Panificio Roma',
                    cardNumber: '9920194820194',
                    barcodeFormat: 'EAN13',
                    color: '#b45309',
                    gradientTo: '#78350f',
                    category: 'dining',
                    // No cardDesignUrl: tests multi-solid colors fallback!
                  });
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
              >
                Custom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
