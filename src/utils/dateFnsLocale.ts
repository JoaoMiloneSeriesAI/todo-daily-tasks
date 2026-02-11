import { enUS, es, ptBR } from 'date-fns/locale';
import { format as dateFnsFormat } from 'date-fns';
import type { Locale } from 'date-fns';
import i18n from '../locales/i18n';

/// <summary>
/// Returns the date-fns locale object matching the current i18n language.
/// Used to localize month names, weekday names, AM/PM, and other date formatting.
/// </summary>
export function getDateLocale(): Locale {
  const lang = i18n.language;
  if (lang === 'es') return es;
  if (lang === 'pt-BR') return ptBR;
  return enUS;
}

/// <summary>
/// Wrapper around date-fns format that capitalizes the first letter of the result.
/// Some locales (pt-BR, es) return lowercase month/day names by convention.
/// This ensures proper capitalization for display (e.g., "fevereiro" -> "Fevereiro").
/// </summary>
export function formatLocalized(date: Date, formatStr: string): string {
  const result = dateFnsFormat(date, formatStr, { locale: getDateLocale() });
  return result.charAt(0).toUpperCase() + result.slice(1);
}
