import { BarcodeFormat } from '../types/card';

export interface BarcodeFormatOption {
  value: BarcodeFormat;
  label: string;
  description: string;
  example: string;
  is2D?: boolean;
}

export const BARCODE_FORMAT_OPTIONS: BarcodeFormatOption[] = [
  {
    value: 'CODE128',
    label: 'Code 128',
    description: 'Universal alphanumeric retail format (Most common)',
    example: '6012 3456 7890',
  },
  {
    value: 'EAN13',
    label: 'EAN-13',
    description: '13-digit standard international product/membership code',
    example: '2093847291038',
  },
  {
    value: 'UPC',
    label: 'UPC-A',
    description: '12-digit standard US/Canada retail barcode',
    example: '042100005264',
  },
  {
    value: 'EAN8',
    label: 'EAN-8',
    description: '8-digit compact European barcode',
    example: '96385074',
  },
  {
    value: 'QR_CODE',
    label: 'QR Code',
    description: '2D matrix barcode (Starbucks, digital apps)',
    example: 'STAR-948102',
    is2D: true,
  },
  {
    value: 'CODE39',
    label: 'Code 39',
    description: 'Alphanumeric loyalty & industrial code',
    example: 'CARD-10294',
  },
  {
    value: 'ITF14',
    label: 'ITF-14',
    description: 'Interleaved 2 of 5 (14 digits)',
    example: '10012345678902',
  },
];

/**
 * Format raw card number with pleasant grouping for human readability
 */
export function formatCardNumberDisplay(num: string): string {
  if (!num) return '';
  const clean = num.replace(/\s+/g, '');
  // If numeric and length >= 8, chunk into 4s
  if (/^\d+$/.test(clean) && clean.length >= 8) {
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  }
  return num;
}

/**
 * Sanitize card number for specific barcode formats if needed
 */
export function sanitizeForBarcode(num: string, format: BarcodeFormat): string {
  const clean = num.replace(/\s+/g, '');
  if (format === 'EAN13') {
    // EAN13 strictly requires 12 or 13 digits
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 13) return digits.slice(0, 13);
    if (digits.length < 12) return digits.padStart(12, '0');
    return digits;
  }
  if (format === 'EAN8') {
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 8) return digits.slice(0, 8);
    if (digits.length < 7) return digits.padStart(7, '0');
    return digits;
  }
  if (format === 'UPC') {
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 12) return digits.slice(0, 12);
    if (digits.length < 11) return digits.padStart(11, '0');
    return digits;
  }
  return clean || '12345678';
}
