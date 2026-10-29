export type BarcodeFormat =
  | 'CODE128'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'CODE39'
  | 'ITF14'
  | 'QR_CODE'
  | 'PDF417';

export type CardCategory =
  | 'retail'
  | 'grocery'
  | 'pharmacy'
  | 'dining'
  | 'fashion'
  | 'sports'
  | 'home'
  | 'travel'
  | 'other';

export interface FidelityCard {
  id: string;
  storeName: string;
  category: CardCategory;
  cardNumber: string;
  barcodeFormat: BarcodeFormat;
  color: string; // Primary hex or tailwind class
  gradientTo?: string; // Optional gradient secondary color
  textColor?: string; // Light or dark text
  iconName?: string;
  frontImage?: string; // Base64 or URL photo of card front
  backImage?: string; // Base64 or URL photo of card back
  logoUrl?: string; // SVG or brand logo URL
  cardDesignUrl?: string; // Matching physical card design template
  notes?: string;
  pointsBalance?: number;
  expiryDate?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
}

export interface BrandPreset {
  id: string;
  name: string;
  category: CardCategory;
  barcodeFormat: BarcodeFormat;
  color: string;
  gradientTo: string;
  textColor: 'light' | 'dark';
  logoPlaceholder: string; // 2-3 letter initials or SVG icon identifier
  sampleNumberPattern: string;
  website?: string;
  country?: string;
  cardDesignUrl?: string; // Authentic card artwork/texture URL
  logoUrl?: string; // Crisp official brand logo
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface DiscountReceipt {
  id: string;
  storeName: string;
  discountDescription: string;
  amount?: string;
  minSpend?: string;
  expiryDate: string; // ISO YYYY-MM-DD
  barcodeNumber?: string;
  barcodeFormat?: BarcodeFormat;
  notes?: string;
  receiptImage?: string; // Base64 photo of the physical receipt
  isUsed: boolean;
  color?: string;
  createdAt: number;
}
