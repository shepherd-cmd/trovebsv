// Live BSV/GBP price utility
// Fetches from CoinGecko with a 5-minute cache and conservative fallback

const FALLBACK_BSV_GBP = 0.05; // ~5p per BSV (conservative fallback)
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
