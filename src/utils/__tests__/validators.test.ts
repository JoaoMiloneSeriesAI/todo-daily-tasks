import { describe, it, expect } from 'vitest';
import { InputValidator } from '../validators';

describe('InputValidator', () => {
  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      expect(InputValidator.sanitizeText('  hello  ')).toBe('hello');
    });

    it('should enforce max length', () => {
      const longText = 'a'.repeat(2000);
      expect(InputValidator.sanitizeText(longText, 100).length).toBe(100);
    });

    it('should strip HTML tags', () => {
      expect(InputValidator.sanitizeText('Hello <script>alert("xss")</script> World')).toBe('Hello alert("xss") World');
    });

    it('should return empty string for null/undefined inputs', () => {
      expect(InputValidator.sanitizeText('')).toBe('');
      expect(InputValidator.sanitizeText(null as any)).toBe('');
      expect(InputValidator.sanitizeText(undefined as any)).toBe('');
    });

    it('should use default max length of 1000', () => {
      const text = 'a'.repeat(1500);
      expect(InputValidator.sanitizeText(text).length).toBe(1000);
    });
  });

  describe('sanitizePrefix', () => {
    it('should trim and enforce 20 char limit', () => {
      const longPrefix = 'a'.repeat(30);
      expect(InputValidator.sanitizePrefix(longPrefix).length).toBe(20);
    });

    it('should strip angle brackets and quotes', () => {
      expect(InputValidator.sanitizePrefix('<bug> "fix"')).toBe('bug fix');
    });

    it('should return empty string for empty input', () => {
      expect(InputValidator.sanitizePrefix('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid https URLs', () => {
      expect(InputValidator.sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should accept valid http URLs', () => {
      expect(InputValidator.sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should reject non-http protocols', () => {
      expect(InputValidator.sanitizeUrl('ftp://example.com')).toBe('');
      expect(InputValidator.sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should reject invalid URLs', () => {
      expect(InputValidator.sanitizeUrl('not a url')).toBe('');
    });

    it('should return empty for empty input', () => {
      expect(InputValidator.sanitizeUrl('')).toBe('');
    });
  });

  describe('validateCardTitle', () => {
    it('should accept valid titles', () => {
      expect(InputValidator.validateCardTitle('Fix login bug')).toEqual({ valid: true });
    });

    it('should reject empty titles', () => {
      const result = InputValidator.validateCardTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject whitespace-only titles', () => {
      const result = InputValidator.validateCardTitle('   ');
      expect(result.valid).toBe(false);
    });

    it('should reject titles over 200 characters', () => {
      const result = InputValidator.validateCardTitle('a'.repeat(201));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('200');
    });

    it('should accept titles at exactly 200 characters', () => {
      expect(InputValidator.validateCardTitle('a'.repeat(200)).valid).toBe(true);
    });
  });

  describe('validateColumnName', () => {
    it('should accept valid column names', () => {
      expect(InputValidator.validateColumnName('In Review')).toEqual({ valid: true });
    });

    it('should reject empty names', () => {
      expect(InputValidator.validateColumnName('').valid).toBe(false);
    });

    it('should reject names over 50 characters', () => {
      expect(InputValidator.validateColumnName('a'.repeat(51)).valid).toBe(false);
    });
  });

  describe('validateTagName', () => {
    it('should accept valid tags', () => {
      expect(InputValidator.validateTagName('urgent')).toEqual({ valid: true });
    });

    it('should reject empty tags', () => {
      expect(InputValidator.validateTagName('').valid).toBe(false);
    });

    it('should reject tags over 30 characters', () => {
      expect(InputValidator.validateTagName('a'.repeat(31)).valid).toBe(false);
    });
  });

  describe('validateDescription', () => {
    it('should accept valid descriptions', () => {
      expect(InputValidator.validateDescription('A short description')).toEqual({ valid: true });
    });

    it('should accept empty descriptions', () => {
      expect(InputValidator.validateDescription('')).toEqual({ valid: true });
    });

    it('should reject descriptions over 2000 characters', () => {
      expect(InputValidator.validateDescription('a'.repeat(2001)).valid).toBe(false);
    });
  });
});
