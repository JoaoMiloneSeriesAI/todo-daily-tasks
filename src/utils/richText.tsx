import React from 'react';
import { ipcService } from '../services/ipcService';

/// <summary>
/// Detects if the current platform is macOS for keyboard shortcut display.
/// </summary>
export function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/// <summary>
/// Returns the modifier key label for the current platform.
/// </summary>
export function modKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

/// <summary>
/// Wraps the selected text in a textarea with the given prefix/suffix markers.
/// If no text is selected, inserts markers at the cursor with cursor between them.
/// Returns the new text and the new cursor position.
/// </summary>
export function wrapSelection(
  textarea: HTMLTextAreaElement,
  text: string,
  prefix: string,
  suffix: string
): { newText: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = text.slice(start, end);

  if (selected) {
    // Wrap selected text
    const wrapped = prefix + selected + suffix;
    const newText = text.slice(0, start) + wrapped + text.slice(end);
    return { newText, cursorPos: start + wrapped.length };
  } else {
    // Insert markers at cursor
    const inserted = prefix + suffix;
    const newText = text.slice(0, start) + inserted + text.slice(end);
    return { newText, cursorPos: start + prefix.length };
  }
}

/// <summary>
/// Inserts a bullet point marker at the start of the current line.
/// </summary>
export function insertBullet(
  textarea: HTMLTextAreaElement,
  text: string
): { newText: string; cursorPos: number } {
  const start = textarea.selectionStart;
  // Find start of current line
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineContent = text.slice(lineStart);

  // If line already starts with "- ", remove it (toggle)
  if (lineContent.startsWith('- ')) {
    const newText = text.slice(0, lineStart) + text.slice(lineStart + 2);
    return { newText, cursorPos: Math.max(start - 2, lineStart) };
  }

  // Otherwise, add "- " at line start
  const newText = text.slice(0, lineStart) + '- ' + text.slice(lineStart);
  return { newText, cursorPos: start + 2 };
}

/// <summary>
/// Wraps selection with triple backticks for a code block.
/// </summary>
export function insertCodeBlock(
  textarea: HTMLTextAreaElement,
  text: string
): { newText: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = text.slice(start, end);

  const prefix = '```\n';
  const suffix = '\n```';

  if (selected) {
    const wrapped = prefix + selected + suffix;
    const newText = text.slice(0, start) + wrapped + text.slice(end);
    return { newText, cursorPos: start + wrapped.length };
  } else {
    const inserted = prefix + suffix;
    const newText = text.slice(0, start) + inserted + text.slice(end);
    return { newText, cursorPos: start + prefix.length };
  }
}

// ---- Marker Protection ----

/// <summary>
/// Marker pairs for formatting protection. Order matters: longer markers first
/// to prevent ~~ from being matched as two ~ markers.
/// </summary>
const MARKER_PAIRS = [
  { marker: '~~', name: 'strikethrough' },
  { marker: '```', name: 'codeblock' },
  { marker: '*', name: 'bold' },
  { marker: '_', name: 'italic' },
  { marker: '~', name: 'underline' },
  { marker: '`', name: 'code' },
];

/// <summary>
/// Handles Backspace/Delete near formatting markers by removing the entire marker pair atomically.
/// Returns null if no marker protection applies (let default behavior proceed).
/// Returns { newText, cursorPos } if a marker pair was removed.
/// </summary>
export function handleMarkerDeletion(
  text: string,
  cursorPos: number,
  isBackspace: boolean
): { newText: string; cursorPos: number } | null {
  for (const { marker } of MARKER_PAIRS) {
    const mLen = marker.length;

    if (isBackspace) {
      // Check if cursor is right after a marker
      if (cursorPos >= mLen && text.slice(cursorPos - mLen, cursorPos) === marker) {
        // Find the matching marker
        // If we're after an opening marker, look forward for the closing one
        const afterCursor = text.indexOf(marker, cursorPos);
        if (afterCursor !== -1) {
          // Remove both markers: the one before cursor and the one after
          const newText = text.slice(0, cursorPos - mLen) + text.slice(cursorPos, afterCursor) + text.slice(afterCursor + mLen);
          return { newText, cursorPos: cursorPos - mLen };
        }
        // If we're after a closing marker, look backward for the opening one
        const beforeMarkerStart = cursorPos - mLen;
        const openingPos = text.lastIndexOf(marker, beforeMarkerStart - 1);
        if (openingPos !== -1) {
          // Remove both markers
          const content = text.slice(openingPos + mLen, beforeMarkerStart);
          const newText = text.slice(0, openingPos) + content + text.slice(cursorPos);
          return { newText, cursorPos: openingPos + content.length };
        }
      }
    } else {
      // Delete key: check if cursor is right before a marker
      if (cursorPos + mLen <= text.length && text.slice(cursorPos, cursorPos + mLen) === marker) {
        // Look for the matching marker after this one
        const closingPos = text.indexOf(marker, cursorPos + mLen);
        if (closingPos !== -1) {
          // Remove both markers
          const content = text.slice(cursorPos + mLen, closingPos);
          const newText = text.slice(0, cursorPos) + content + text.slice(closingPos + mLen);
          return { newText, cursorPos };
        }
        // Look backward for the opening marker
        const openingPos = text.lastIndexOf(marker, cursorPos - 1);
        if (openingPos !== -1 && openingPos < cursorPos) {
          const content = text.slice(openingPos + mLen, cursorPos);
          const newText = text.slice(0, openingPos) + content + text.slice(cursorPos + mLen);
          return { newText, cursorPos: openingPos + content.length };
        }
      }
    }
  }

  return null;
}

// ---- Rich Text Renderer ----

/// <summary>
/// Parses inline formatting (*bold*, _italic_, `code`, ~~strikethrough~~, ~underline~, and URLs).
/// Returns React nodes with appropriate styling.
/// Order matters: code and strikethrough before underline/bold/italic to avoid partial matches.
/// </summary>
function renderInlineFormatting(text: string, keyPrefix: string): React.ReactNode[] {
  // Pattern order: code, strikethrough (~~), bold (*), italic (_), underline (~), URLs
  // Strikethrough must come before underline since ~~ would otherwise match two ~ groups
  const pattern = /(`[^`]+`)|(~~[^~]+~~)|(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(https?:\/\/[^\s]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`${keyPrefix}-t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    const fullMatch = match[0];
    const idx = match.index;

    if (match[1]) {
      // Inline code: `code`
      const code = fullMatch.slice(1, -1);
      parts.push(
        <code key={`${keyPrefix}-c-${idx}`} className="px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]">
          {code}
        </code>
      );
    } else if (match[2]) {
      // Strikethrough: ~~text~~
      const strikeText = fullMatch.slice(2, -2);
      parts.push(<span key={`${keyPrefix}-s-${idx}`} className="line-through">{strikeText}</span>);
    } else if (match[3]) {
      // Bold: *text*
      const bold = fullMatch.slice(1, -1);
      parts.push(<strong key={`${keyPrefix}-b-${idx}`} className="font-bold">{bold}</strong>);
    } else if (match[4]) {
      // Italic: _text_
      const italic = fullMatch.slice(1, -1);
      parts.push(<em key={`${keyPrefix}-i-${idx}`} className="italic">{italic}</em>);
    } else if (match[5]) {
      // Underline: ~text~
      const underlineText = fullMatch.slice(1, -1);
      parts.push(<span key={`${keyPrefix}-ul-${idx}`} className="underline">{underlineText}</span>);
    } else if (match[6]) {
      // URL
      const url = fullMatch;
      parts.push(
        <a
          key={`${keyPrefix}-u-${idx}`}
          href={url}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); ipcService.openExternal(url); }}
          className="text-[var(--color-accent)] underline hover:opacity-80 cursor-pointer"
        >
          {url}
        </a>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`${keyPrefix}-t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={`${keyPrefix}-empty`}>{text}</span>];
}

/// <summary>
/// Renders a full description with rich text formatting:
/// - Code blocks (```...```)
/// - Bullet lists (- item)
/// - Inline bold (*text*), italic (_text_), code (`code`), and URLs
///
/// When inline=true (WYSIWYG overlay mode), code blocks render as simple spans
/// with the same font/line-height as the textarea to keep the cursor aligned.
/// When inline=false (default, read mode), code blocks render with line numbers.
/// </summary>
export function renderFormattedDescription(text: string, inline: boolean = false): React.ReactNode {
  if (!text) return null;

  // Split by code blocks first (```...```)
  const codeBlockPattern = /```([\s\S]*?)```/g;
  const segments: { type: 'text' | 'codeblock'; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'codeblock', content: match[1] });
    lastIndex = codeBlockPattern.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return (
    <>
      {segments.map((segment, segIdx) => {
        if (segment.type === 'codeblock') {
          const codeContent = segment.content.replace(/^\n/, '');

          if (inline) {
            // WYSIWYG overlay mode: same font/size as textarea for cursor alignment
            // Render the ``` markers as invisible spans so they take the same space
            return (
              <React.Fragment key={`seg-${segIdx}`}>
                <span className="opacity-30">```</span>
                {'\n'}
                <span className="rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]">{codeContent || ' '}</span>
                {'\n'}
                <span className="opacity-30">```</span>
              </React.Fragment>
            );
          }

          // Read mode: fancy table with line numbers
          const codeLines = codeContent ? codeContent.split('\n') : [''];
          return (
            <div key={`seg-${segIdx}`} className="my-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {codeLines.map((line, lineIdx) => (
                    <tr key={lineIdx}>
                      <td className="text-right pr-3 pl-3 py-0 select-none text-[var(--color-text-tertiary)] text-[10px] font-mono w-8 border-r border-[var(--color-border)] align-top leading-relaxed">
                        {lineIdx + 1}
                      </td>
                      <td className="pl-3 pr-3 py-0 text-xs font-mono text-[var(--color-text-primary)] whitespace-pre leading-relaxed">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Process text segments: split into lines for bullet detection
        const lines = segment.content.split('\n');
        const elements: React.ReactNode[] = [];
        let bulletBuffer: string[] = [];

        const flushBullets = () => {
          if (bulletBuffer.length > 0) {
            elements.push(
              <ul key={`ul-${segIdx}-${elements.length}`} className="my-1 ml-4 space-y-0.5">
                {bulletBuffer.map((item, li) => (
                  <li key={li} className="list-disc text-[var(--color-text-secondary)]">
                    {renderInlineFormatting(item, `${segIdx}-li-${li}`)}
                  </li>
                ))}
              </ul>
            );
            bulletBuffer = [];
          }
        };

        lines.forEach((line, lineIdx) => {
          const bulletMatch = line.match(/^[-*]\s+(.*)/);
          if (bulletMatch) {
            bulletBuffer.push(bulletMatch[1]);
          } else {
            flushBullets();
            if (line === '' && lineIdx < lines.length - 1) {
              elements.push(<br key={`br-${segIdx}-${lineIdx}`} />);
            } else if (line !== '' || lineIdx === lines.length - 1) {
              elements.push(
                <span key={`line-${segIdx}-${lineIdx}`}>
                  {renderInlineFormatting(line, `${segIdx}-${lineIdx}`)}
                  {lineIdx < lines.length - 1 && '\n'}
                </span>
              );
            }
          }
        });

        flushBullets();
        return <React.Fragment key={`seg-${segIdx}`}>{elements}</React.Fragment>;
      })}
    </>
  );
}

/// <summary>
/// Checks which formatting markers surround the cursor position.
/// Returns a Set of active format names ('bold', 'italic', 'underline', 'strikethrough', 'code').
/// </summary>
export function getActiveFormats(text: string, cursorPos: number): Set<string> {
  const active = new Set<string>();

  const checks: { name: string; marker: string }[] = [
    { name: 'bold', marker: '*' },
    { name: 'italic', marker: '_' },
    { name: 'code', marker: '`' },
  ];

  for (const { name, marker } of checks) {
    const before = text.lastIndexOf(marker, cursorPos - 1);
    const after = text.indexOf(marker, cursorPos);
    if (before !== -1 && after !== -1 && after > before) {
      // Check there's no closing marker between 'before' and cursor
      const between = text.slice(before + marker.length, cursorPos);
      if (!between.includes(marker)) {
        active.add(name);
      }
    }
  }

  // Strikethrough: ~~
  const strikeBefore = text.lastIndexOf('~~', cursorPos - 1);
  const strikeAfter = text.indexOf('~~', cursorPos);
  if (strikeBefore !== -1 && strikeAfter !== -1 && strikeAfter > strikeBefore) {
    const between = text.slice(strikeBefore + 2, cursorPos);
    if (!between.includes('~~')) {
      active.add('strikethrough');
    }
  }

  // Underline: ~ (single, but not ~~)
  // Check for single ~ that isn't part of ~~
  const tildes = text.lastIndexOf('~', cursorPos - 1);
  const tildeAfter = text.indexOf('~', cursorPos);
  if (tildes !== -1 && tildeAfter !== -1 && tildeAfter > tildes) {
    // Make sure it's not ~~
    const isBefore = tildes > 0 && text[tildes - 1] === '~';
    const isAfterDouble = tildeAfter + 1 < text.length && text[tildeAfter + 1] === '~';
    if (!isBefore && !isAfterDouble) {
      const between = text.slice(tildes + 1, cursorPos);
      if (!between.includes('~')) {
        active.add('underline');
      }
    }
  }

  return active;
}
