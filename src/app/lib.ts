// Shared constants + safe helpers
export const PRICE = '899';
export const ORIG_PRICE = '2000';
export const INSTAGRAM_HANDLE = 'datespot_group';
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const TELEGRAM_URL = 'https://t.me/+JOYVaKXWmeI5NThl';
export const UPI_ID = 'BHARATPE2R0S0C1D6V46619@unitype';
export const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyCKSBtujafafwO6z_vwD7y0NfMFD7qG3nHdNOBEi-oWXg9yyBFCiGzESM-hFpcaAyg/exec';

// localStorage can throw (private mode / blocked storage)
export const store = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};
