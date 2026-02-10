import i18n from '../locales/i18n';

/// <summary>
/// Provides input validation and sanitization for user-supplied data.
/// Prevents XSS-adjacent issues and enforces reasonable length limits.
/// </summary>
export class InputValidator {
  /// <summary>
  /// Sanitizes general text input by trimming whitespace, enforcing max length,
  /// and stripping potentially dangerous characters.
  /// </summary>
  static sanitizeText(text: string, maxLength: number = 1000): string {
    if (!text || typeof text !== 'string') return '';

    let sanitized = text.trim();

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Strip HTML-like tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    return sanitized;
  }

  /// <summary>
  /// Sanitizes template prefix strings. Limited to 20 chars, strips
  /// angle brackets and quotes that could break rendering.
  /// </summary>
  static sanitizePrefix(prefix: string): string {
    if (!prefix || typeof prefix !== 'string') return '';

    let sanitized = prefix.trim();

    if (sanitized.length > 20) {
      sanitized = sanitized.substring(0, 20);
    }

    sanitized = sanitized.replace(/[<>"']/g, '');

    return sanitized;
  }

  /// <summary>
  /// Validates and sanitizes URLs. Only allows http and https protocols.
  /// Returns empty string for invalid URLs.
  /// </summary>
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';

    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return '';
    }

    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return '';
    }
  }

  /// <summary>
  /// Validates a card title. Must be non-empty and under 200 characters.
  /// </summary>
  static validateCardTitle(title: string): { valid: boolean; error?: string } {
    if (!title || !title.trim()) {
      return { valid: false, error: i18n.t('validation.titleRequired') };
    }

    if (title.trim().length > 200) {
      return { valid: false, error: i18n.t('validation.titleTooLong') };
    }

    return { valid: true };
  }

  /// <summary>
  /// Validates a column name. Must be non-empty and under 50 characters.
  /// </summary>
  static validateColumnName(name: string): { valid: boolean; error?: string } {
    if (!name || !name.trim()) {
      return { valid: false, error: i18n.t('validation.columnNameRequired') };
    }

    if (name.trim().length > 50) {
      return { valid: false, error: i18n.t('validation.columnNameTooLong') };
    }

    return { valid: true };
  }

  /// <summary>
  /// Validates a tag name. Must be non-empty and under 30 characters.
  /// </summary>
  static validateTagName(tag: string): { valid: boolean; error?: string } {
    if (!tag || !tag.trim()) {
      return { valid: false, error: i18n.t('validation.tagRequired') };
    }

    if (tag.trim().length > 30) {
      return { valid: false, error: i18n.t('validation.tagTooLong') };
    }

    return { valid: true };
  }

  /// <summary>
  /// Validates a card description. Optional but limited to 2000 characters.
  /// </summary>
  static validateDescription(description: string): { valid: boolean; error?: string } {
    if (description && description.length > 2000) {
      return { valid: false, error: i18n.t('validation.descriptionTooLong') };
    }

    return { valid: true };
  }
}
