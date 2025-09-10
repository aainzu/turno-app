import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LocalizedDate,
  getLocalizedDate,
  parseDate,
  normalizeDateInput,
  isValidDate,
  getWeekStart,
  getWeekEnd,
  formatDateISO,
  formatDateShort,
  formatDateForDisplay,
  isToday,
  getDateRange,
  setGlobalLocaleConfig,
  ARGENTINA_TIMEZONE,
  ARGENTINA_LOCALE
} from '../date';

// Mock de Date para tests consistentes
const mockDate = new Date('2025-09-03T12:00:00Z');
const originalDate = global.Date;

describe('LocalizedDate', () => {
  beforeEach(() => {
    // Mock de Date constructor
    global.Date = vi.fn(() => mockDate) as any;
    global.Date.now = vi.fn(() => mockDate.getTime());
    
    // Configurar para Argentina en los tests
    setGlobalLocaleConfig({
      timezone: ARGENTINA_TIMEZONE,
      locale: ARGENTINA_LOCALE,
      weekStartsOn: 1
    });
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  it('should create LocalizedDate from string', () => {
    const date = new LocalizedDate('2025-09-03');
    expect(date.year).toBe(2025);
    expect(date.month).toBe(9);
    expect(date.day).toBe(3);
  });

  it('should create LocalizedDate from Date object', () => {
    const jsDate = new Date('2025-09-03T00:00:00');
    const date = new LocalizedDate(jsDate);
    expect(date.year).toBe(2025);
    expect(date.month).toBe(9);
    expect(date.day).toBe(3);
  });

  it('should format date to ISO string', () => {
    const date = LocalizedDate.fromISO('2025-09-03');
    expect(date.formatISO()).toBe('2025-09-03');
  });

  it('should format date to short string', () => {
    const date = LocalizedDate.fromISO('2025-09-03');
    expect(date.formatShort()).toBe('03/09/2025');
  });

  it('should add days correctly', () => {
    const date = LocalizedDate.fromISO('2025-09-03');
    const newDate = date.addDays(5);
    expect(newDate.formatISO()).toBe('2025-09-08');
  });

  it('should subtract days correctly', () => {
    const date = LocalizedDate.fromISO('2025-09-03');
    const newDate = date.subtractDays(2);
    expect(newDate.formatISO()).toBe('2025-09-01');
  });

  it('should compare dates correctly', () => {
    const date1 = LocalizedDate.fromISO('2025-09-03');
    const date2 = LocalizedDate.fromISO('2025-09-04');
    const date3 = LocalizedDate.fromISO('2025-09-03');

    expect(date1.compare(date2)).toBeLessThan(0);
    expect(date2.compare(date1)).toBeGreaterThan(0);
    expect(date1.compare(date3)).toBe(0);
  });
});

describe('Date Utilities', () => {
  beforeEach(() => {
    global.Date = vi.fn(() => mockDate) as any;
    global.Date.now = vi.fn(() => mockDate.getTime());
    
    // Configurar para Argentina en los tests
    setGlobalLocaleConfig({
      timezone: ARGENTINA_TIMEZONE,
      locale: ARGENTINA_LOCALE,
      weekStartsOn: 1
    });
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  it('should get current localized date', () => {
    const date = getLocalizedDate();
    expect(date).toBeInstanceOf(LocalizedDate);
  });

  it('should parse date from string', () => {
    const date = parseDate('2025-09-03');
    expect(date.formatISO()).toBe('2025-09-03');
  });

  it('should normalize date input from DD/MM/YYYY', () => {
    const normalized = normalizeDateInput('03/09/2025');
    expect(normalized).toBe('2025-09-03');
  });

  it('should normalize date input from YYYY-MM-DD', () => {
    const normalized = normalizeDateInput('2025-09-03');
    expect(normalized).toBe('2025-09-03');
  });

  it('should validate valid date', () => {
    expect(isValidDate('2025-09-03')).toBe(true);
    expect(isValidDate('2025-13-45')).toBe(false);
  });

  it('should get week start (Monday)', () => {
    // 2025-09-03 is a Wednesday, so week start should be Monday 2025-09-01
    const date = LocalizedDate.fromISO('2025-09-03');
    const weekStart = getWeekStart(date);
    expect(weekStart.formatISO()).toBe('2025-09-01');
  });

  it('should get week end (Sunday)', () => {
    // 2025-09-03 is a Wednesday, so week end should be Sunday 2025-09-07
    const date = LocalizedDate.fromISO('2025-09-03');
    const weekEnd = getWeekEnd(date);
    expect(weekEnd.formatISO()).toBe('2025-09-07');
  });

  it('should format date for display in Spanish', () => {
    const date = LocalizedDate.fromISO('2025-09-03');
    const formatted = formatDateForDisplay(date);
    expect(formatted).toContain('2025');
    expect(formatted).toContain('septiembre');
  });

  it('should check if date is today', () => {
    const today = getLocalizedDate();
    expect(isToday(today)).toBe(true);

    const yesterday = today.subtractDays(1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('should get date range', () => {
    const start = LocalizedDate.fromISO('2025-09-01');
    const end = LocalizedDate.fromISO('2025-09-03');
    const range = getDateRange(start, end);

    expect(range).toHaveLength(3);
    expect(range[0].formatISO()).toBe('2025-09-01');
    expect(range[1].formatISO()).toBe('2025-09-02');
    expect(range[2].formatISO()).toBe('2025-09-03');
  });

  it('should throw error for invalid date normalization', () => {
    expect(() => normalizeDateInput('invalid-date')).toThrow('Formato de fecha no válido');
  });
});
