import { test, expect } from '@playwright/test';
import { calculateTransferPercent } from '../../../src/utils/transferProgress.js';

test('calculateTransferPercent rounds normal transfer progress', () => {
  expect(calculateTransferPercent(1, 3)).toBe(33);
  expect(calculateTransferPercent(2, 3)).toBe(67);
});

test('calculateTransferPercent clamps over-complete and negative values', () => {
  expect(calculateTransferPercent(120, 100)).toBe(100);
  expect(calculateTransferPercent(-10, 100)).toBe(0);
});

test('calculateTransferPercent returns zero for invalid totals', () => {
  expect(calculateTransferPercent(10, 0)).toBe(0);
  expect(calculateTransferPercent(10, Number.NaN)).toBe(0);
});
