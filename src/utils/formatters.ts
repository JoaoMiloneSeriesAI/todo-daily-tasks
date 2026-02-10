import { format as dateFnsFormat } from 'date-fns';
import { AppSettings } from '../types/settings';
import { getDateLocale } from './dateFnsLocale';

/// <summary>
/// Formats a duration in milliseconds to a human-readable string.
/// Extracted as a standalone function for use outside of TimeTracker context.
/// </summary>
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 0) return '0m';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

/// <summary>
/// Formats a date using the user's preferred date format from settings.
/// Falls back to 'MM/dd/yyyy' if no format is specified.
/// </summary>
export function formatDate(date: Date, settings?: AppSettings): string {
  const dateFormat = settings?.general?.dateFormat || 'MM/dd/yyyy';
  try {
    return dateFnsFormat(date, dateFormat, { locale: getDateLocale() });
  } catch {
    return dateFnsFormat(date, 'MM/dd/yyyy', { locale: getDateLocale() });
  }
}

/// <summary>
/// Formats a time using the user's preferred time format (12h or 24h).
/// </summary>
export function formatTime(date: Date, settings?: AppSettings): string {
  const timeFormat = settings?.general?.timeFormat || '12h';
  const formatStr = timeFormat === '24h' ? 'HH:mm' : 'h:mm a';
  try {
    return dateFnsFormat(date, formatStr, { locale: getDateLocale() });
  } catch {
    return dateFnsFormat(date, 'h:mm a', { locale: getDateLocale() });
  }
}

/// <summary>
/// Formats a date and time together using user preferences.
/// </summary>
export function formatDateTime(date: Date, settings?: AppSettings): string {
  return `${formatDate(date, settings)} ${formatTime(date, settings)}`;
}
