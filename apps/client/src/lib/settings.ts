import type { PaymentMethodConfig, WebsiteSettings } from '@/types';

export const DEFAULT_BOOKING_TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export function parseJsonSetting<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeTimeSlots(slots: string[]): string[] {
  return Array.from(
    new Set(
      slots
        .map((slot) => slot.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function normalizeDateList(dates: string[]): string[] {
  return Array.from(
    new Set(
      dates
        .map((date) => date.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

export function getBookingTimeSlots(settings: WebsiteSettings): string[] {
  const parsed = parseJsonSetting<string[]>(settings.booking_time_slots, DEFAULT_BOOKING_TIME_SLOTS);
  return normalizeTimeSlots(parsed.length > 0 ? parsed : DEFAULT_BOOKING_TIME_SLOTS);
}

export function getBookingBlackoutDates(settings: WebsiteSettings): string[] {
  return normalizeDateList(parseJsonSetting<string[]>(settings.booking_blackout_dates, []));
}

export function getActiveBookingWindowDays(settings: WebsiteSettings): number {
  const raw = Number(settings.booking_window_days || '30');
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}

export function getBookingMaxPerSlot(settings: WebsiteSettings): number {
  const raw = Number(settings.booking_max_per_slot || '1');
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

export function getBookingAdvanceNoticeDays(settings: WebsiteSettings): number {
  const raw = Number(settings.booking_advance_notice_days || '0');
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
}

export function getPaymentMethods(settings: WebsiteSettings): PaymentMethodConfig[] {
  const parsed = parseJsonSetting<PaymentMethodConfig[]>(settings.payment_methods, []);

  if (parsed.length > 0) {
    return parsed.filter((method) => method.label?.trim()).map((method, index) => ({
      id: method.id || `method-${index + 1}`,
      label: method.label,
      type: method.type || 'bank_transfer',
      bankName: method.bankName || '',
      accountName: method.accountName || '',
      accountNumber: method.accountNumber || '',
      instructions: method.instructions || '',
      isActive: method.isActive !== false,
    }));
  }

  const legacyLabel = settings.payment_bank_name || 'Transfer Bank';
  const hasLegacyData =
    settings.payment_bank_name || settings.payment_account_name || settings.payment_account_number || settings.payment_instructions;

  if (!hasLegacyData) return [];

  return [
    {
      id: 'legacy-bank-transfer',
      label: legacyLabel,
      type: 'bank_transfer',
      bankName: settings.payment_bank_name || '',
      accountName: settings.payment_account_name || '',
      accountNumber: settings.payment_account_number || '',
      instructions: settings.payment_instructions || '',
      isActive: true,
    },
  ];
}
