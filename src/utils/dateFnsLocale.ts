import { enUS, es, ptBR } from 'date-fns/locale';
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
