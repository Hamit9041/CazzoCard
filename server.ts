import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Increase payload limit for image uploads
app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Endpoint: /api/scan-card
 * Analyzes the WHOLE loyalty card image (brand name, printed barcode/number, and colors)
 */
app.post('/api/scan-card', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: `You are an expert loyalty card visual analyzer for retail cards (especially Italian stores like Esselunga, Conad, Coop, Decathlon, IKEA, Trenitalia CartaFRECCIA, Tigotà, Acqua & Sapone, MediaWorld, Unieuro, Sephora, etc. as well as global brands).
Examine this entire loyalty card photo:
1. Identify the store / retailer brand name (e.g. "Conad", "Esselunga", "Coop", "Decathlon", "IKEA Family", "Trenitalia").
2. Read the membership / customer card number or barcode number visible on the card (check both printed text numbers under barcode or any account numbers).
3. Determine the probable barcode symbology: EAN13 (for 13 digits like Conad, Esselunga, Coop), CODE128 (alphanumeric or 10-12 digits), QR_CODE, or UPC.
4. Extract 2 vibrant, contrasting solid theme colors representing this brand's card design:
   - primaryColor (hex string, e.g. "#f59c00" for Conad orange, "#073a26" for Esselunga green, "#e2001a" for Coop red, "#1e2229" for CartaFRECCIA black, "#0082c3" for Decathlon blue)
   - secondaryColor (hex string, e.g. "#d6001c" for Conad red, "#d4af37" for Esselunga gold, "#ffffff" for Coop white, "#d90429" for CartaFRECCIA red, "#005885" for Decathlon dark blue, "#ffcc00" for IKEA yellow)
5. Identify the store category (grocery, retail, pharmacy, sports, travel, fashion, home, dining, other).

Return clean JSON matching the schema.`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: { type: Type.STRING },
            cardNumber: { type: Type.STRING },
            barcodeFormat: {
              type: Type.STRING,
              enum: ['EAN13', 'CODE128', 'QR_CODE', 'UPC', 'EAN8'],
            },
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            category: {
              type: Type.STRING,
              enum: [
                'grocery',
                'retail',
                'pharmacy',
                'travel',
                'sports',
                'fashion',
                'home',
                'dining',
                'other',
              ],
            },
            confidence: { type: Type.STRING },
          },
          required: ['storeName', 'cardNumber', 'primaryColor', 'secondaryColor'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Card scan error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze card image' });
  }
});

/**
 * Endpoint: /api/ocr-receipt
 * OCR on discount receipts / store coupons (e.g. "Buono sconto 5€ su spesa minima 30€", expiry date)
 */
app.post('/api/ocr-receipt', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: `You are an expert OCR receipt & discount voucher scanner.
Analyze this discount receipt / coupon slip (often given by supermarkets like Conad, Esselunga, Coop, Carrefour, Decathlon, etc. for next purchase discounts).

Extract:
1. storeName: Retailer name (e.g. "Conad", "Esselunga", "Coop", "Decathlon")
2. discountDescription: A clear summary of the offer (e.g. "€5 off on next purchase over €30", "20% discount on fresh produce", "Buono spesa 5€")
3. amount: The discount amount if stated (e.g. "€5.00", "20%", "€10")
4. minSpend: Minimum purchase amount required to use the discount if stated (e.g. "€25.00", "€30.00", or empty if none)
5. expiryDate: The exact expiration date in ISO format YYYY-MM-DD (e.g. "2026-11-15"). If only month/day or relative date is shown, assume year 2026.
6. barcodeNumber: Any barcode number, coupon code, or voucher PIN printed on the voucher for cashier scanning (e.g. "98024910284" or promo code).
7. barcodeFormat: "EAN13", "CODE128", "QR_CODE", or "UPC" if applicable.
8. notes: Any specific terms (e.g. "Excludes electronics and gift cards", "Valid only at store of issue")

Return clean JSON matching the schema.`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: { type: Type.STRING },
            discountDescription: { type: Type.STRING },
            amount: { type: Type.STRING },
            minSpend: { type: Type.STRING },
            expiryDate: { type: Type.STRING, description: 'ISO date YYYY-MM-DD' },
            barcodeNumber: { type: Type.STRING },
            barcodeFormat: {
              type: Type.STRING,
              enum: ['EAN13', 'CODE128', 'QR_CODE', 'UPC', 'EAN8'],
            },
            notes: { type: Type.STRING },
          },
          required: ['storeName', 'discountDescription', 'expiryDate'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Receipt OCR error:', err);
    return res.status(500).json({ error: err.message || 'Failed to OCR discount receipt' });
  }
});

async function startServer() {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}

startServer();

