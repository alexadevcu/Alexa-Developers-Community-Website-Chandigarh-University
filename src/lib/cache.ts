/**
 * Simple in-memory + sessionStorage cache for instant page transitions & Supabase queries (SWR)
 */

const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache

export function getCachedData<T>(key: string): T | null {
  // Check in-memory first
  const memoryItem = memoryCache.get(key);
  if (memoryItem && Date.now() - memoryItem.timestamp < CACHE_TTL_MS) {
    return memoryItem.data as T;
  }

  // Check sessionStorage
  try {
    const raw = sessionStorage.getItem(`adc_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data as T;
      }
    }
  } catch (e) {
    // Ignore storage quota or parsing errors
  }

  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  const item = { data, timestamp: Date.now() };
  memoryCache.set(key, item);
  try {
    sessionStorage.setItem(`adc_cache_${key}`, JSON.stringify(item));
  } catch (e) {
    // Ignore storage quota errors
  }
}
