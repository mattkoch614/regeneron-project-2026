import { describe, it, expect } from 'vitest';
import { formatNumber, formatCount, formatQuality } from './formatters';

describe('formatNumber', () => {
  it('should format numbers >= 1000 with k suffix', () => {
    expect(formatNumber(1000)).toBe('1.0k');
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(10000)).toBe('10.0k');
    expect(formatNumber(50000)).toBe('50.0k');
  });

  it('should return numbers < 1000 as string', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });
});

describe('formatCount', () => {
  it('should format numbers with locale-specific separators', () => {
    expect(formatCount(1000)).toBe('1,000');
    expect(formatCount(10000)).toBe('10,000');
    expect(formatCount(100000)).toBe('100,000');
  });

  it('should handle small numbers', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(100)).toBe('100');
  });
});

describe('formatQuality', () => {
  it('should format quality scores with 4 decimals', () => {
    expect(formatQuality(0.8934)).toBe('0.8934');
    expect(formatQuality(0.9)).toBe('0.9000');
    expect(formatQuality(0.75)).toBe('0.7500');
    expect(formatQuality(1)).toBe('1.0000');
  });

  it('should round to 4 decimals', () => {
    expect(formatQuality(0.123456789)).toBe('0.1235');
  });
});