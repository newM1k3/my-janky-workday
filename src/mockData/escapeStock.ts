import type { EscapeStockData } from '../types';

export const escapeStockMock: EscapeStockData = {
  lowStock: [
    { item: 'Waivers (printed)', qty: 12, threshold: 50 },
    { item: 'Combo Padlocks', qty: 3, threshold: 10 },
    { item: 'UV Pens', qty: 6, threshold: 15 },
    { item: 'Hint Cards – Room 3', qty: 2, threshold: 10 },
  ],
  topConsumed: [
    { item: 'Hand sanitizer', usedThisWeek: 18 },
    { item: 'Waivers (printed)', usedThisWeek: 14 },
    { item: 'Pens (misc)', usedThisWeek: 11 },
    { item: 'Batteries AA', usedThisWeek: 8 },
  ],
};
