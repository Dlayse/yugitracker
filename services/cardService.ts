import { ApiCard } from '../types';
import { normalizeStr } from '../utils';

// Official YGOPRODeck API v7
const BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

export const searchCards = async (query: string): Promise<ApiCard[]> => {
  if (!query || query.length < 3) return [];
  
  const cleanQuery = normalizeStr(query);
  const tokens = cleanQuery.split(' ').filter(t => t.length > 0);
  if (tokens.length === 0) return [];
  
  // Simple optimization: search by longest word to narrow down results quickly
  const mainTerm = tokens.sort((a, b) => b.length - a.length)[0];
  
  try {
    // Optimization: Request misc info immediately to avoid re-fetching in Modal
    const res = await fetch(`${BASE_URL}?fname=${encodeURIComponent(mainTerm)}&misc=yes`);
    if (!res.ok) {
        if (res.status === 400) return [];
        throw new Error(`API Error: ${res.status}`);
    }

    const json = await res.json();
    if (!json.data) return [];
    
    // Client-side strict filtering
    return json.data.filter((c: ApiCard) => {
      const name = normalizeStr(c.name);
      return tokens.every(token => name.includes(token));
    });

  } catch (e) {
    console.error("SearchCards Error:", e);
    return [];
  }
};

export const getCardDetails = async (name: string): Promise<ApiCard | null> => {
  if (!name) return null;
  const cleanName = name.trim();

  try {
    // 1. Try Exact Match first (fastest and most accurate for ID)
    let url = `${BASE_URL}?name=${encodeURIComponent(cleanName)}&misc=yes`;
    let res = await fetch(url);

    // 2. Fallback to Fuzzy if Exact fails
    if (!res.ok) {
        url = `${BASE_URL}?fname=${encodeURIComponent(cleanName)}&misc=yes`;
        res = await fetch(url);
    }

    if (!res.ok) return null;

    const json = await res.json();
    if (!json.data || json.data.length === 0) return null;

    // Return the first/best match
    // We do NOT do complex merging here anymore to keep performance high
    return json.data[0];

  } catch (e) {
    console.error("GetCardDetails Exception:", e);
    return null;
  }
};