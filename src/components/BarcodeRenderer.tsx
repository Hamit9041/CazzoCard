import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { BarcodeFormat } from '../types/card';
import { sanitizeForBarcode } from '../utils/barcode';

interface BarcodeRendererProps {
  value: string;
  format: BarcodeFormat;
  className?: string;
  height?: number;
  widthScale?: number;
  showText?: boolean;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format,
  className = '',
  height = 90,
  widthScale = 2,
  showText = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const is2D = format === 'QR_CODE' || format === 'PDF417';

  useEffect(() => {
    setRenderError(null);
    if (!value || value.trim() === '') {
      return;
    }

    if (format === 'QR_CODE') {
      if (!canvasRef.current) return;
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: Math.max(height * 2, 180),
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.warn('QR Code generation error:', error);
            setRenderError('Could not generate QR code');
          }
        }
      );
      return;
    }

    // 1D Barcode via JsBarcode
    if (svgRef.current) {
      try {
        const sanitized = sanitizeForBarcode(value, format);
        let jsFormat: string = format;
        if (format === 'UPC') jsFormat = 'UPC';
        else if (format === 'EAN13') jsFormat = 'EAN13';
        else if (format === 'EAN8') jsFormat = 'EAN8';
        else if (format === 'CODE39') jsFormat = 'CODE39';
        else if (format === 'ITF14') jsFormat = 'ITF14';
        else jsFormat = 'CODE128';

        JsBarcode(svgRef.current, sanitized, {
          format: jsFormat,
          width: widthScale,
          height: height,
          displayValue: showText,
          margin: 8,
          background: '#ffffff',
          lineColor: '#000000',
          fontSize: 14,
          font: 'JetBrains Mono',
          textMargin: 4,
          valid: (valid) => {
            if (!valid) {
              // Try fallback to CODE128 if specific format rejected input
              try {
                if (svgRef.current) {
                  JsBarcode(svgRef.current, value.replace(/\s+/g, ''), {
                    format: 'CODE128',
                    width: widthScale,
                    height: height,
                    displayValue: showText,
                    margin: 8,
                    background: '#ffffff',
                    lineColor: '#000000',
                  });
                }
              } catch (fallbackErr) {
                setRenderError('Invalid code for this format');
              }
            }
          },
        });
      } catch (err: any) {
        // Fallback to Code128
        try {
          if (svgRef.current) {
            JsBarcode(svgRef.current, value.replace(/\s+/g, ''), {
              format: 'CODE128',
              width: widthScale,
              height: height,
              displayValue: showText,
              margin: 8,
              background: '#ffffff',
              lineColor: '#000000',
            });
          }
        } catch {
          setRenderError('Barcode format error');
        }
      }
    }
  }, [value, format, height, widthScale, showText]);

  if (renderError) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-lg text-xs text-center border border-amber-200 dark:border-amber-900/50 ${className}`}>
        <p className="font-medium">{renderError}</p>
        <p className="text-[11px] opacity-75 mt-0.5">Value: {value}</p>
      </div>
    );
  }

  if (is2D) {
    return (
      <div className={`flex items-center justify-center bg-white p-3 rounded-xl shadow-sm ${className}`}>
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-white p-2 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};
