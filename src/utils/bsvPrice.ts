// Live BSV/GBP price utility
// Fetches from CoinGecko with a 5-minute cache and conservative fallback

const FALLBACK_BSV_GBP = 28; // ~£28 per BSV (conservative real-world fallback)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cachedPrice: number | null = null;
let cacheTime = 0;

export async function getBsvGbpPrice(): Promise<number> {
  const now = Date.now();
  if (cachedPrice !== null && now - cacheTime < CACHE_TTL) {
    return cachedPrice;
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-sv&vs_currencies=gbp',
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const price = data['bitcoin-sv']?.gbp;
    if (price && price > 0) {
      cachedPrice = price;
      cacheTime = now;
      return price;
    }
  } catch {
    // Fall through to fallback
  }

  return cachedPrice ?? FALLBACK_BSV_GBP;
}

/** Convert satoshis to a formatted GBP string, e.g. "£0.03" */
export function satsToGbp(sats: number, bsvGbpPrice: number): string {
  const gbp = (sats / 100_000_000) * bsvGbpPrice;
  if (gbp < 0.005) return `£${gbp.toFixed(4)}`;
  return `£${gbp.toFixed(2)}`;
}

/** Convert GBP to satoshis at the given price */
export function gbpToSats(gbp: number, bsvGbpPrice: number): number {
  return Math.round((gbp / bsvGbpPrice) * 100_000_000);
}

/**
 * Calculate inscription fee in satoshis based on file size.
 * Formula: 500 sat base (tx overhead) + 2 sats per KB of image data.
 * At £28/BSV a 1MB image costs ~£0.0008; at £1000/BSV ~£0.03.
 */
export function calculateInscriptionFeeSats(fileSizeBytes: number): number {
  const BASE_SATS = 500;
  const SATS_PER_KB = 2;
  return BASE_SATS + Math.ceil(fileSizeBytes / 1024) * SATS_PER_KB;
}

/**
 * Estimate file size in bytes from a data URL.
 * Base64 encodes 3 bytes as 4 chars, so actual size ≈ base64Length × 0.75.
 */
export function estimateSizeFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.round(base64.length * 0.75);
}
